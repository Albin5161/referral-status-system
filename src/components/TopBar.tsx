import { Link, useLocation } from 'react-router-dom'
import { Briefcase, MessageSquare } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { RoleSwitcher } from './RoleSwitcher'

// Persistent top bar. Carries the text-based identity mark (no LinkedIn trademark
// assets — PRD §0), primary nav, and the prototype-only role switcher (§4).
export function TopBar() {
  const { role } = useApp()
  const { pathname } = useLocation()

  const navItem = (to: string, label: string, icon: React.ReactNode) => {
    const active = pathname === to || pathname.startsWith(to + '/')
    return (
      <Link
        to={to}
        className={`inline-flex items-center gap-1.5 px-1 py-3 text-sm border-b-2 transition-colors ${
          active
            ? 'border-ink text-ink font-semibold'
            : 'border-transparent text-ink-muted hover:text-ink'
        }`}
      >
        {icon}
        {label}
      </Link>
    )
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-3xl items-center gap-4 px-4">
        <Link to="/thread" className="flex items-center gap-2 py-2.5">
          <span className="grid h-8 w-8 place-items-center rounded bg-accent text-sm font-bold text-white">
            in
          </span>
          <span className="hidden flex-col leading-tight sm:flex">
            <span className="text-[13px] font-semibold text-ink">
              LinkedIn Concept
            </span>
            <span className="text-[11px] text-ink-muted">Referral Status</span>
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          {navItem('/thread', 'Messaging', <MessageSquare size={16} />)}
          {role === 'requester' &&
            navItem('/my-jobs', 'My Jobs', <Briefcase size={16} />)}
        </nav>

        <div className="ml-auto">
          <RoleSwitcher />
        </div>
      </div>
    </header>
  )
}
