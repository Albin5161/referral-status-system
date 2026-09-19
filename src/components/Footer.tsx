import { useApp } from '../context/AppContext'
import { useTour } from '../context/TourContext'

// Persistent disclaimer — PRD §0. Also surfaces the demo-control note for the
// role switcher so the perspective toggle is never mistaken for real product UI.
export function Footer() {
  const { role } = useApp()
  const { restartTest, replayOnboarding, openFeedback } = useTour()
  return (
    <footer className="mx-auto mt-8 max-w-3xl px-4 pb-10 text-center">
      <p className="text-[11px] leading-relaxed text-ink-faint">
        Concept prototype — not affiliated with or endorsed by LinkedIn.
      </p>
      <p className="mt-1 text-[11px] leading-relaxed text-ink-faint">
        You are viewing as{' '}
        <span className="font-medium text-ink-muted">
          {role === 'requester' ? 'Requester' : 'Referrer'}
        </span>{' '}
        · the role switcher above is a demo control, not part of the real product.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-ink-faint">
        <button onClick={openFeedback} className="underline hover:text-ink-muted">
          Give feedback
        </button>
        <button onClick={replayOnboarding} className="underline hover:text-ink-muted">
          Show intro again
        </button>
        <button
          onClick={() => {
            if (window.confirm('Start the test over? This clears all requests, statuses and messages.'))
              restartTest()
          }}
          className="underline hover:text-ink-muted"
        >
          Restart test
        </button>
      </div>
    </footer>
  )
}
