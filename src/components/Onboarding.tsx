import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, Bell, FileText, X } from 'lucide-react'
import { useTour } from '../context/TourContext'
import { ME, RECIPIENT } from '../sampleData'
import { Avatar } from './Avatar'
import { Button } from './Button'
import { LinkedInLogo } from './LinkedInIcons'
import { StatusBadge } from './StatusBadge'

interface Slide {
  eyebrow: string
  title: string
  body: ReactNode
  visual: ReactNode
}

const SLIDES: Slide[] = [
  {
    eyebrow: 'New · Referral Status',
    title: 'Ask for a referral, and know where it stands',
    body: 'Referral Status turns a referral ask into something you can follow. No more wondering if your message was seen, and no awkward follow-ups.',
    visual: <CardVisual />,
  },
  {
    eyebrow: 'How it works',
    title: 'Your referrer keeps you posted',
    body: 'Every request starts as Pending. As things move, your referrer updates the status, and you get notified each time it changes.',
    visual: <TimelineVisual />,
  },
  {
    eyebrow: 'About this test',
    title: 'You’ll play both people',
    body: (
      <>
        You start as <b className="font-semibold text-ink">{ME.name}</b>, who is job hunting.
        Halfway through, you switch to <b className="font-semibold text-ink">{RECIPIENT.name}</b>,
        who has been asked for the referral. The switch sits in the top bar.
      </>
    ),
    visual: <RolesVisual />,
  },
  {
    eyebrow: 'Your task · about 3 minutes',
    title: 'Here’s what to do',
    body: 'A dark bar at the top of the screen always shows your next step. At the end, we’ll ask a few quick questions about how it went.',
    visual: <TaskVisual />,
  },
]

// Usability-test intro. Full screen on phones, a centred dialog from md up.
export function Onboarding() {
  const { showOnboarding, finishOnboarding } = useTour()
  const [i, setI] = useState(0)
  const primaryRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (showOnboarding) setI(0)
  }, [showOnboarding])

  useEffect(() => {
    if (!showOnboarding) return
    primaryRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finishOnboarding()
      if (e.key === 'ArrowRight') setI((n) => Math.min(n + 1, SLIDES.length - 1))
      if (e.key === 'ArrowLeft') setI((n) => Math.max(n - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showOnboarding, i, finishOnboarding])

  if (!showOnboarding) return null

  const slide = SLIDES[i]
  const last = i === SLIDES.length - 1

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/50 md:items-center md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="animate-pop-in flex w-full flex-col overflow-hidden bg-surface md:max-w-[440px] md:rounded-card md:shadow-pop"
      >
        {/* Top bar: brand + skip */}
        <div className="flex items-center justify-between px-4 pt-[max(12px,env(safe-area-inset-top))] md:pt-3">
          <LinkedInLogo size={26} />
          <button
            onClick={finishOnboarding}
            aria-label="Skip intro"
            className="rounded-full p-1.5 text-ink-muted hover:bg-black/5 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        {/* Visual */}
        <div
          key={`v${i}`}
          className="animate-fade-in mx-4 mt-3 grid h-[240px] md:h-[200px] place-items-center rounded-card bg-surface-page px-5"
          aria-hidden
        >
          {slide.visual}
        </div>

        {/* Copy */}
        <div key={`c${i}`} className="animate-fade-in flex-1 px-5 pt-5">
          <p className="text-[12px] font-semibold text-ink-muted">{slide.eyebrow}</p>
          <h2 id="onboarding-title" className="mt-1 text-[22px] font-semibold leading-tight text-ink">
            {slide.title}
          </h2>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">{slide.body}</p>
        </div>

        {/* Progress + controls */}
        <div className="flex items-center gap-3 px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6">
          <div className="flex flex-1 items-center gap-1.5" aria-label={`Step ${i + 1} of ${SLIDES.length}`}>
            {SLIDES.map((_, n) => (
              <span
                key={n}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  n === i ? 'w-5 bg-ink' : 'w-1.5 bg-black/20'
                }`}
              />
            ))}
          </div>
          {i > 0 && (
            <Button variant="ghost" onClick={() => setI(i - 1)}>
              Back
            </Button>
          )}
          <Button
            ref={primaryRef}
            onClick={() => (last ? finishOnboarding() : setI(i + 1))}
            className="px-5"
          >
            {last ? 'Start the task' : 'Next'}
            {!last && <ArrowRight size={16} />}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ——— Slide visuals: small compositions of the prototype's own UI ———

function CardVisual() {
  return (
    <div className="w-full max-w-[280px] overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-start gap-3 p-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded bg-accent/10 text-accent">
          <FileText size={16} />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
            Referral Request
          </p>
          <p className="truncate text-[14px] font-semibold text-ink">UX Designer, Google Cloud</p>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="text-[12px] text-ink-muted">Status</span>
            <StatusBadge status="Considering" size="sm" />
          </div>
        </div>
      </div>
      <div className="border-t border-line px-3 py-2 text-[12px] font-semibold text-accent">
        View Referral Status
      </div>
    </div>
  )
}

function TimelineVisual() {
  return (
    <div className="flex w-full max-w-[280px] flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <StatusBadge status="Pending" size="sm" />
        <span className="h-px flex-1 bg-black/15" />
        <StatusBadge status="Considering" size="sm" />
        <span className="h-px flex-1 bg-black/15" />
        <StatusBadge status="Referred" size="sm" />
      </div>
      <div className="flex items-start gap-2.5 rounded-card border border-line bg-surface p-2.5 shadow-card">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <Bell size={14} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-ink">Your referral status was updated</p>
          <p className="text-[12px] text-ink-muted">New status: Referred</p>
        </div>
      </div>
    </div>
  )
}

function RolesVisual() {
  return (
    <div className="flex w-full max-w-[280px] flex-col items-center gap-4">
      <div className="flex w-full items-center justify-between">
        <Person name={ME.name} role="Requester" />
        <ArrowRight size={18} className="text-ink-muted" />
        <Person name={RECIPIENT.name} role="Referrer" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-ink-muted">Viewing as</span>
        <div className="flex items-center rounded-full bg-black/[0.06] p-0.5">
          <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-ink shadow-sm">
            Requester
          </span>
          <span className="px-2.5 py-1 text-xs font-medium text-ink-muted">Referrer</span>
        </div>
      </div>
    </div>
  )
}

function Person({ name, role }: { name: string; role: string }) {
  return (
    <div className="flex w-24 flex-col items-center text-center">
      <Avatar name={name} size={44} />
      <p className="mt-1.5 text-[13px] font-semibold leading-tight text-ink">{name}</p>
      <p className="text-[11px] text-ink-muted">{role}</p>
    </div>
  )
}

function TaskVisual() {
  const tasks = [
    `As ${ME.name.split(' ')[0]}, ask ${RECIPIENT.name.split(' ')[0]} for a referral`,
    `Switch to ${RECIPIENT.name.split(' ')[0]} and respond to it`,
    `Switch back and check the update`,
  ]
  return (
    <ol className="w-full max-w-[280px] space-y-2">
      {tasks.map((t, n) => (
        <li
          key={t}
          className="flex items-center gap-2.5 rounded-card border border-line bg-surface px-3 py-2 shadow-card"
        >
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">
            {n + 1}
          </span>
          <span className="text-[13px] text-ink">{t}</span>
        </li>
      ))}
    </ol>
  )
}
