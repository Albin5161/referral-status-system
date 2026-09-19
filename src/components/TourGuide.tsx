import { CircleHelp } from 'lucide-react'
import { TOUR_STEP_COUNT, useTour, useTourStep } from '../context/TourContext'

// Test-only guide bar under the header. Dark, so it reads as scaffolding and
// never as LinkedIn UI. Always names the one next thing to do.
export function TourGuide() {
  const { replayOnboarding, openFeedback, feedbackSubmitted } = useTour()
  const step = useTourStep()
  const done = step.id === 'done'

  return (
    <div className="bg-ink text-white">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
        <span className="shrink-0 text-[12px] font-semibold tabular-nums text-white/70">
          {done ? 'Done' : `Step ${step.index + 1}/${TOUR_STEP_COUNT}`}
        </span>
        <p aria-live="polite" className="min-w-0 flex-1 text-[13px] leading-snug">
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
    </div>
  )
}
