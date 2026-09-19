import { useEffect, useRef, useState } from 'react'
import { Check, CircleHelp } from 'lucide-react'
import { TOUR_STEP_COUNT, useTour, useTourStep } from '../context/TourContext'

// Test-only guide bar under the header. Dark, so it reads as scaffolding and
// never as LinkedIn UI. Always names the one next thing to do; the spotlight
// (TourSpotlight) points at where to do it.
export function TourGuide() {
  const { replayOnboarding, openFeedback, feedbackSubmitted } = useTour()
  const step = useTourStep()
  const done = step.id === 'done'

  // Brief tick when the tester completes a step, before the next one shows.
  const prevIndex = useRef(step.index)
  const [justDone, setJustDone] = useState(false)
  useEffect(() => {
    if (step.index > prevIndex.current) {
      setJustDone(true)
      const t = window.setTimeout(() => setJustDone(false), 1200)
      prevIndex.current = step.index
      return () => window.clearTimeout(t)
    }
    prevIndex.current = step.index
  }, [step.index])

  return (
    <div className="relative bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <span className="flex w-[58px] shrink-0 items-center text-[12px] font-semibold tabular-nums text-white/70">
          {justDone ? (
            <span key="tick" className="animate-step-done inline-flex items-center gap-1 text-white">
              <span className="grid h-4 w-4 place-items-center rounded-full bg-white text-ink">
                <Check size={11} strokeWidth={3} />
              </span>
              Nice
            </span>
          ) : done ? (
            'Done'
          ) : (
            `Step ${step.index + 1}/${TOUR_STEP_COUNT}`
          )}
        </span>
        <p
          key={step.text}
          aria-live="polite"
          className="animate-slide-up min-w-0 flex-1 text-[13px] leading-snug"
        >
          {step.text}
        </p>
        {done && !feedbackSubmitted ? (
          <button
            onClick={openFeedback}
            className="shrink-0 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-ink hover:bg-white/90"
          >
            Give feedback
          </button>
        ) : (
          <button
            onClick={replayOnboarding}
            aria-label="Show the intro again"
            title="Show the intro again"
            className="shrink-0 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <CircleHelp size={18} />
          </button>
        )}
      </div>
      {/* Progress through the six steps */}
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-white/15" aria-hidden>
        <div
          className="h-full bg-white transition-[width] duration-500 ease-out"
          style={{ width: `${(step.index / TOUR_STEP_COUNT) * 100}%` }}
        />
      </div>
    </div>
  )
}
