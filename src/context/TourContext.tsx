import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useApp } from './AppContext'
import { RECIPIENT } from '../sampleData'
import { clearSession, load, save } from '../storage'

// Usability-test scaffolding: onboarding, the "what to do next" guide and the
// end-of-journey feedback form. Kept apart from AppContext so the product state
// (requests, statuses, messages) stays free of test concerns.

export type TourStepId =
  | 'ask'
  | 'switch-to-referrer'
  | 'open-messaging'
  | 'update-status'
  | 'switch-back'
  | 'see-outcome'
  | 'done'

export const TOUR_STEP_COUNT = 6

export interface TourStep {
  id: TourStepId
  index: number // 0-based; TOUR_STEP_COUNT when done
  text: string
  // Where to click next: data-tour ids in priority order. The spotlight rings
  // the first one that is visible on screen right now.
  targets: string[]
  // A genuine choice: ring EVERY visible target equally instead of picking one,
  // so the guide never steers testers towards a particular path.
  choice?: boolean
}

export interface FeedbackInput {
  rating: number
  useful: 'yes' | 'no'
  usefulWhy: string
  improve: string
}

export interface FeedbackEntry extends FeedbackInput {
  entryPoint: string // 'Messaging' | 'Job Tracker' | '' if they never sent a request
  completedJourney: boolean
  viewport: string
  userAgent: string
  submittedAt: string
}

interface TourState {
  showOnboarding: boolean
  finishOnboarding: () => void
  replayOnboarding: () => void

  // Set once the requester has opened Referral Status after Alex's update.
  outcomeSeen: boolean
  markOutcomeSeen: () => void

  feedbackOpen: boolean
  feedbackSubmitted: boolean
  openFeedback: () => void
  closeFeedback: () => void
  submitFeedback: (input: FeedbackInput) => Promise<void>

  restartTest: () => void

  // A new visit found someone else's unfinished journey: continue or start fresh?
  resumePrompt: boolean
  resumeJourney: () => void
}

const TourContext = createContext<TourState | null>(null)

// Where responses go. Set VITE_FEEDBACK_ENDPOINT to a Formspree (or similar)
// URL that accepts a JSON POST. Without it, responses stay in localStorage only.
const FEEDBACK_ENDPOINT = import.meta.env.VITE_FEEDBACK_ENDPOINT as string | undefined

// Shared test devices: progress lives in localStorage so a refresh never loses
// a tester's place, but the NEXT tester must not inherit it. A browser tab is
// one visit (sessionStorage marks it). On a new visit we start fresh if the last
// journey was finished or has sat idle; if it stopped recently we ask, since
// it may be the same person who closed the tab by accident.
const IDLE_RESET_MS = 30 * 60 * 1000

const RESUME_CANDIDATE: boolean = (() => {
  let newVisit = true
  try {
    const key = 'referral-status:visit'
    newVisit = !sessionStorage.getItem(key)
    sessionStorage.setItem(key, '1')
  } catch {
    // sessionStorage unavailable: treat every load as a continuing visit
    newVisit = false
  }
  if (!newVisit) return false

  const started =
    load('tour:onboardingDone', false) || load<unknown[]>('referralRequests', []).length > 0
  if (!started) return false

  const idle = Date.now() - load('tour:lastActive', 0) > IDLE_RESET_MS
  if (idle || load('tour:outcomeSeen', false)) {
    clearSession() // runs before any provider reads its initial state
    return false
  }
  return true
})()

export function TourProvider({ children }: { children: ReactNode }) {
  const { resetPrototype } = useApp()
  const navigate = useNavigate()
  const [onboardingDone, setOnboardingDone] = useState(() => load('tour:onboardingDone', false))
  const [outcomeSeen, setOutcomeSeen] = useState(() => load('tour:outcomeSeen', false))
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(() =>
    load('tour:feedbackSubmitted', false),
  )
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [resumePrompt, setResumePrompt] = useState(RESUME_CANDIDATE)

  // Last sign of life, for the idle reset above. Throttled to one write per 10s.
  useEffect(() => {
    let last = 0
    const touch = () => {
      const now = Date.now()
      if (now - last < 10_000) return
      last = now
      save('tour:lastActive', now)
    }
    touch()
    window.addEventListener('pointerdown', touch)
    window.addEventListener('keydown', touch)
    return () => {
      window.removeEventListener('pointerdown', touch)
      window.removeEventListener('keydown', touch)
    }
  }, [])

  useEffect(() => save('tour:onboardingDone', onboardingDone), [onboardingDone])
  useEffect(() => save('tour:outcomeSeen', outcomeSeen), [outcomeSeen])
  useEffect(() => save('tour:feedbackSubmitted', feedbackSubmitted), [feedbackSubmitted])

  const finishOnboarding = useCallback(() => setOnboardingDone(true), [])
  const replayOnboarding = useCallback(() => setOnboardingDone(false), [])
  const markOutcomeSeen = useCallback(() => setOutcomeSeen(true), [])
  const openFeedback = useCallback(() => setFeedbackOpen(true), [])
  const closeFeedback = useCallback(() => setFeedbackOpen(false), [])

  const submitFeedback = useCallback(
    async ({ rating, useful, usefulWhy, improve }: FeedbackInput) => {
      const entry: FeedbackEntry = {
        rating,
        useful,
        usefulWhy: usefulWhy.trim(),
        improve: improve.trim(),
        entryPoint: load('tour:entryPoint', ''),
        completedJourney: outcomeSeen,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        userAgent: navigator.userAgent,
        submittedAt: new Date().toISOString(),
      }
      // Always keep a local copy, so nothing is lost if the network call fails.
      save('tour:feedback', [...load<FeedbackEntry[]>('tour:feedback', []), entry])

      if (FEEDBACK_ENDPOINT) {
        const res = await fetch(FEEDBACK_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(entry),
        })
        if (!res.ok) throw new Error(`Feedback endpoint returned ${res.status}`)
      } else {
        console.info('[feedback] VITE_FEEDBACK_ENDPOINT not set; stored locally only', entry)
      }
      setFeedbackSubmitted(true)
    },
    [outcomeSeen],
  )

  const restartTest = useCallback(() => {
    resetPrototype()
    setOutcomeSeen(false)
    setFeedbackSubmitted(false)
    setFeedbackOpen(false)
    setOnboardingDone(false)
    setResumePrompt(false)
    navigate('/')
  }, [resetPrototype, navigate])

  const resumeJourney = useCallback(() => setResumePrompt(false), [])

  const value = useMemo<TourState>(
    () => ({
      showOnboarding: !onboardingDone && !resumePrompt,
      finishOnboarding,
      replayOnboarding,
      outcomeSeen,
      markOutcomeSeen,
      feedbackOpen,
      feedbackSubmitted,
      openFeedback,
      closeFeedback,
      submitFeedback,
      restartTest,
      resumePrompt,
      resumeJourney,
    }),
    [
      resumePrompt,
      resumeJourney,
      onboardingDone,
      finishOnboarding,
      replayOnboarding,
      outcomeSeen,
      markOutcomeSeen,
      feedbackOpen,
      feedbackSubmitted,
      openFeedback,
      closeFeedback,
      submitFeedback,
      restartTest,
    ],
  )

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTour(): TourState {
  const ctx = useContext(TourContext)
  if (!ctx) throw new Error('useTour must be used within TourProvider')
  return ctx
}

// The next thing the tester should do, derived from the shared prototype state
// and the current screen (never stored), so it stays right however the tester
// moves around.
// eslint-disable-next-line react-refresh/only-export-components
export function useTourStep(): TourStep {
  const { role, referralRequests, statusUpdates, seenRequestIds } = useApp()
  const { outcomeSeen } = useTour()
  const { pathname, search } = useLocation()
  const on = (prefix: string) => pathname.startsWith(prefix)

  const toAlex = referralRequests.filter((r) => r.recipientId === RECIPIENT.id)
  const alexResponded = statusUpdates.some(
    (u) => u.changedBy === RECIPIENT.name && toAlex.some((r) => r.id === u.referralRequestId),
  )
  const step = (id: TourStepId, index: number, text: string, targets: string[] = []): TourStep => ({
    id,
    index,
    text,
    targets,
  })

  if (outcomeSeen) {
    // No spotlight: the tester should be free to read the result in peace.
    return step('done', TOUR_STEP_COUNT, 'All done! Take your time with the result.')
  }

  // 1 · Ask Alex for a referral — guided screen by screen, for both entry points.
  if (toAlex.length === 0) {
    if (role === 'referrer') {
      return step('ask', 0, 'Switch to Requester in the top bar to start as Albin.', ['role-requester'])
    }
    if (on('/jobs')) {
      return step(
        'ask',
        0,
        'Find the Google role, tap Ask for referral, then choose Alex Johnson.',
        ['pick-u2', 'ask-job1'],
      )
    }
    if (on('/compose')) {
      const lean = search.includes('job=')
      return step(
        'ask',
        0,
        lean
          ? 'Read the message, attach your resume, then review and send it.'
          : 'Keep Referral Request selected, attach the job and your resume, then review and send.',
        ['attach-job', 'attach-resume', 'send-request', 'review-request'],
      )
    }
    if (on('/messaging')) {
      return step('ask', 0, 'Open your chat with Alex Johnson and tap Compose to ask for a referral.', [
        'compose-btn',
        'convo-u2',
      ])
    }
    // Two equal entry points: which one testers pick is itself a finding.
    return {
      ...step('ask', 0, 'Ask Alex Johnson for a referral, whichever way feels natural to you.', [
        'home-from-messaging',
        'home-from-jobs',
      ]),
      choice: true,
    }
  }

  if (!alexResponded) {
    // 2 · Become Alex.
    if (role === 'requester') {
      return step('switch-to-referrer', 1, 'Request sent! Now switch to Referrer in the top bar to see Alex’s side.', [
        'role-referrer',
      ])
    }
    // 3 · Find the request through the badge.
    const unseen = toAlex.some((r) => !seenRequestIds.includes(r.id))
    if (unseen) {
      return on('/messaging')
        ? step('open-messaging', 2, 'Open your conversation with Albin to see the request.', ['convo-u2'])
        : step('open-messaging', 2, 'You’re Alex now. Tap Messaging: the red badge is Albin’s new request.', [
            'nav-messaging',
          ])
    }
    // 4 · Respond.
    if (on('/status/')) {
      return step('update-status', 3, 'Pick the option that fits, then send your update to Albin.', [
        'send-update',
        'referrer-options',
      ])
    }
    return step('update-status', 3, 'Tap View Referral Status on Albin’s request to respond.', [
      'view-status',
      'convo-u2',
      'nav-messaging',
    ])
  }

  // 5 · Back to Albin.
  if (role === 'referrer') {
    return step('switch-back', 4, 'Update sent! Switch back to Requester to see what Albin sees.', [
      'role-requester',
    ])
  }
  // 6 · See the update where Albin would.
  return on('/notifications')
    ? step('see-outcome', 5, 'Tap Alex’s update to see the new status.', ['notification-new'])
    : step('see-outcome', 5, 'Alex replied. Open Notifications (the bell) to see the update.', [
        'nav-notifications',
      ])
}
