import { useApp } from '../context/AppContext'

// Persistent disclaimer — PRD §0. Also surfaces the demo-control note for the
// role switcher so the perspective toggle is never mistaken for real product UI.
export function Footer() {
  const { role, resetPrototype } = useApp()
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
      <button
        onClick={() => {
          if (
            window.confirm(
              'Reset all prototype data (requests, statuses, messages)?',
            )
          )
            resetPrototype()
        }}
        className="mt-2 text-[11px] text-ink-faint underline hover:text-ink-muted"
      >
        Reset prototype data
      </button>
    </footer>
  )
}
