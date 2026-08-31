import { useApp } from '../context/AppContext'
import type { Role } from '../types'

// Prototype-only role switcher — PRD §4. Clearly labeled as a demo control, not
// part of the real product. Switches which perspective renders against the same
// shared localStorage data.
export function RoleSwitcher() {
  const { role, setRole } = useApp()

  const option = (value: Role, label: string) => {
    const active = role === value
    return (
      <button
        onClick={() => setRole(value)}
        aria-pressed={active}
        className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
          active ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
        }`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-[11px] text-ink-faint md:inline">
        Viewing as
      </span>
      <div className="flex items-center rounded-full bg-black/[0.06] p-0.5">
        {option('requester', 'Requester')}
        {option('referrer', 'Referrer')}
      </div>
    </div>
  )
}
