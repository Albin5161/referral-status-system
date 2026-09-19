import { useEffect, useRef } from 'react'
import { RotateCcw } from 'lucide-react'
import { TOUR_STEP_COUNT, useTour, useTourStep } from '../context/TourContext'
import { Button } from './Button'

// Shown on a new visit when an unfinished journey was left recently. Starting
// fresh is the default: on a shared test device it's usually a new person.
export function ResumePrompt() {
  const { resumePrompt, resumeJourney, restartTest } = useTour()
  const step = useTourStep()
  const freshRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (resumePrompt) freshRef.current?.focus()
  }, [resumePrompt])

  if (!resumePrompt) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="resume-title"
        className="animate-slide-up w-full rounded-t-2xl bg-surface px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-5 md:max-w-[420px] md:rounded-card md:shadow-pop"
      >
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
          <RotateCcw size={20} />
        </span>
        <h2 id="resume-title" className="mt-3 text-[20px] font-semibold leading-tight text-ink">
          Someone started this test earlier
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-ink-muted">
          They stopped at step {Math.min(step.index + 1, TOUR_STEP_COUNT)} of {TOUR_STEP_COUNT}. If
          that was you, carry on. Otherwise, start fresh so you see the whole experience.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row-reverse">
          <Button ref={freshRef} onClick={restartTest} className="py-2">
            Start fresh
          </Button>
          <Button variant="ghost" onClick={resumeJourney} className="py-2">
            Continue where it stopped
          </Button>
        </div>
      </div>
    </div>
  )
}
