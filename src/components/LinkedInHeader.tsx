import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  ChevronDown,
  Grid3x3,
  Home,
  MessageSquare,
  Search,
  Users,
  Waypoints,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ME, RECIPIENT } from '../sampleData'
import { Avatar } from './Avatar'
import { RoleSwitcher } from './RoleSwitcher'

// LinkedIn-style top navigation. Layout, density and the single blue accent are
// modeled on the real product; the brand mark is a NON-trademark glyph plus the
// "LinkedIn Concept" text identity (PRD §0 — no LinkedIn logo/wordmark asset).
export function LinkedInHeader() {
  const { role, notifications } = useApp()
  const { pathname } = useLocation()
  const me = role === 'requester' ? ME : RECIPIENT

  const messagingUnread =
    role === 'requester' ? notifications.filter((n) => !n.read).length : 0

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="mx-auto flex h-[52px] max-w-6xl items-center gap-2 px-4">
        {/* Brand mark (non-trademark) + search */}
        <Link to="/" className="flex shrink-0 items-center gap-1" title="LinkedIn Concept · Referral Status">
          <span className="grid h-8 w-8 place-items-center rounded bg-accent text-white">
            <Waypoints size={18} />
          </span>
        </Link>
        <label className="relative hidden items-center sm:flex">
          <Search
            size={16}
            className="pointer-events-none absolute left-2.5 text-ink-muted"
          />
          <input
            placeholder="Search"
            className="w-56 rounded bg-[#edf3f8] py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-ink-muted"
          />
        </label>

        {/* Primary nav */}
        <nav className="ml-auto flex items-stretch">
          <NavItem to="/" active={isActive('/')} icon={<Home size={20} />} label="Home" />
          <NavStatic icon={<Users size={20} />} label="My Network" />
          {role === 'requester' ? (
            <NavItem
              to="/jobs"
              active={isActive('/jobs')}
              icon={<Briefcase size={20} />}
              label="Jobs"
            />
          ) : (
            <NavStatic icon={<Briefcase size={20} />} label="Jobs" />
          )}
          <NavItem
            to="/messaging"
            active={isActive('/messaging')}
            icon={<MessageSquare size={20} />}
            label="Messaging"
            badge={messagingUnread}
          />
          <NavStatic icon={<Bell size={20} />} label="Notifications" badge={7} />
          <NavStatic
            icon={<Avatar name={me.name} size={24} />}
            label="Me"
            caret
          />
        </nav>

        {/* Divider + faux business links (decorative) */}
        <div className="hidden items-stretch border-l border-line pl-1 lg:flex">
          <NavStatic icon={<Grid3x3 size={20} />} label="For Business" caret />
        </div>

        {/* Prototype-only role switcher (PRD §4) */}
        <div className="ml-1 shrink-0 border-l border-line pl-2">
          <RoleSwitcher />
        </div>
      </div>
    </header>
  )
}

function NavItem({
  to,
  active,
  icon,
  label,
  badge,
}: {
  to: string
  active: boolean
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  return (
    <Link
      to={to}
      className={`relative flex w-[72px] flex-col items-center justify-center border-b-2 pt-1 text-[11px] transition-colors ${
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-muted hover:text-ink'
      }`}
    >
      <span className="relative">
        {icon}
        {badge ? <Badge count={badge} /> : null}
      </span>
      <span className="mt-0.5">{label}</span>
    </Link>
  )
}

// Decorative nav entries that are intentionally inert (not part of the prototype).
function NavStatic({
  icon,
  label,
  badge,
  caret,
}: {
  icon: React.ReactNode
  label: string
  badge?: number
  caret?: boolean
}) {
  return (
    <div
      className="relative hidden w-[72px] cursor-default flex-col items-center justify-center border-b-2 border-transparent pt-1 text-[11px] text-ink-muted sm:flex"
      aria-hidden
    >
      <span className="relative">
        {icon}
        {badge ? <Badge count={badge} /> : null}
      </span>
      <span className="mt-0.5 flex items-center gap-0.5">
        {label}
        {caret && <ChevronDown size={12} />}
      </span>
    </div>
  )
}

function Badge({ count }: { count: number }) {
  return (
    <span className="absolute -right-2 -top-1 grid min-w-[16px] place-items-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-4 text-white">
      {count}
    </span>
  )
}
