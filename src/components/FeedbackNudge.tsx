import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { MessageSquareHeart, X } from 'lucide-react'
import { useTour } from '../context/TourContext'
import { hasMobileChrome } from './LinkedInHeader'

// How long the tester gets with the final status before we ask for anything.
const READ_TIME_MS = 6000

// A small, dismissible card at the bottom of the screen. It never covers the
// status the tester just reached; the survey opens only when they choose.
export function FeedbackNudge() {
  const { outcomeSeen, feedbackSubmitted, feedbackOpen, openFeedback } = useTour()
  const { pathname } = useLocation()
  const [ready, setReady] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!outcomeSeen) {
      setReady(false)
      setDismissed(false)
      return
    }
    const t = window.setTimeout(() => setReady(true), READ_TIME_MS)
    return () => window.clearTimeout(t)
  }, [outcomeSeen])

  if (!ready || dismissed || feedbackSubmitted || feedbackOpen) return null

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4 md:bottom-4 ${
        hasMobileChrome(pathname) ? 'bottom-20' : 'bottom-4'
      }`}
    >
      <div
        role="status"
        className="animate-slide-up pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-card border border-line bg-surface p-3 shadow-pop"
      >
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <MessageSquareHeart size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">You finished the task</p>
          <p className="text-[13px] text-ink-muted">
            Whenever you’re ready, tell us how it went. It takes about a minute.
          </p>
          <button
            data-tour="feedback-nudge"
            onClick={openFeedback}
            className="mt-2 rounded-full bg-accent px-3.5 py-1 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            Give feedback
          </button>
        </div>
        <button
          onClick={() => setDismissed(true)}
          aria-label="Later"
          title="Later"
          className="rounded-full p-1 text-ink-muted hover:bg-black/5 hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
