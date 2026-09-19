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
import { load, save } from '../storage'

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
}

export interface FeedbackInput {
  rating: number
  useful: 'yes' | 'no'
  usefulWhy: string
  improve: string
}

export interface FeedbackEntry extends FeedbackInput {
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
}

const TourContext = createContext<TourState | null>(null)

// Where responses go. Set VITE_FEEDBACK_ENDPOINT to a Formspree (or similar)
// URL that accepts a JSON POST. Without it, responses stay in localStorage only.
const FEEDBACK_ENDPOINT = import.meta.env.VITE_FEEDBACK_ENDPOINT as string | undefined

export function TourProvider({ children }: { children: ReactNode }) {
  const { resetPrototype } = useApp()
  const navigate = useNavigate()
  const [onboardingDone, setOnboardingDone] = useState(() => load('tour:onboardingDone', false))
  const [outcomeSeen, setOutcomeSeen] = useState(() => load('tour:outcomeSeen', false))
  const [feedbackPrompted, setFeedbackPrompted] = useState(() =>
    load('tour:feedbackPrompted', false),
  )
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(() =>
    load('tour:feedbackSubmitted', false),
  )
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  useEffect(() => save('tour:onboardingDone', onboardingDone), [onboardingDone])
  useEffect(() => save('tour:outcomeSeen', outcomeSeen), [outcomeSeen])
  useEffect(() => save('tour:feedbackPrompted', feedbackPrompted), [feedbackPrompted])
  useEffect(() => save('tour:feedbackSubmitted', feedbackSubmitted), [feedbackSubmitted])

  // Ask for feedback once, shortly after the tester lands on the final status —
  // long enough for them to take in the screen they just reached.
  useEffect(() => {
    if (!outcomeSeen || feedbackPrompted) return
    const t = window.setTimeout(() => {
      setFeedbackPrompted(true)
      setFeedbackOpen(true)
    }, 1800)
    return () => window.clearTimeout(t)
  }, [outcomeSeen, feedbackPrompted])

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
    setFeedbackPrompted(false)
    setFeedbackSubmitted(false)
    setFeedbackOpen(false)
    setOnboardingDone(false)
    navigate('/')
  }, [resetPrototype, navigate])

  const value = useMemo<TourState>(
    () => ({
      showOnboarding: !onboardingDone,
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
    }),
    [
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
// (never stored), so it stays right however the tester moves around.
// eslint-disable-next-line react-refresh/only-export-components
export function useTourStep(): TourStep {
  const { role, referralRequests, statusUpdates, seenRequestIds } = useApp()
  const { outcomeSeen } = useTour()
  const { pathname } = useLocation()
  const inMessaging = pathname.startsWith('/messaging')
  const onStatus = pathname.startsWith('/status/')

  const toAlex = referralRequests.filter((r) => r.recipientId === RECIPIENT.id)
  const alexResponded = statusUpdates.some(
    (u) => u.changedBy === RECIPIENT.name && toAlex.some((r) => r.id === u.referralRequestId),
  )
  const step = (id: TourStepId, index: number, text: string): TourStep => ({ id, index, text })

  if (outcomeSeen) return step('done', TOUR_STEP_COUNT, "That's the whole journey. Thanks for trying it!")

  if (toAlex.length === 0) {
    return step(
      'ask',
      0,
      role === 'requester'
        ? 'Ask Alex Johnson for a referral, from Messaging or your Job Tracker.'
        : 'Switch to Requester in the top bar, then ask Alex Johnson for a referral.',
    )
  }

  if (!alexResponded) {
    if (role === 'requester') {
      return step('switch-to-referrer', 1, 'Request sent. Now switch to Referrer in the top bar to see Alex’s side.')
    }
    const unseen = toAlex.some((r) => !seenRequestIds.includes(r.id))
    if (unseen) {
      return step(
        'open-messaging',
        2,
        inMessaging
          ? 'Open your conversation with Albin to see the request.'
          : 'You’re Alex now. Tap Messaging: the red badge is Albin’s new request.',
      )
    }
    return step(
      'update-status',
      3,
      onStatus
        ? 'Pick the option that fits and send your update to Albin.'
        : 'Open the Referral Request card and update its status.',
    )
  }

  return role === 'referrer'
    ? step('switch-back', 4, 'Status updated. Switch back to Requester to see what Albin sees.')
    : step('see-outcome', 5, 'Alex replied. Open Notifications (the bell) to see the update.')
}
