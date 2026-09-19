import { Link, useLocation } from 'react-router-dom'
import {
  Bell,
  Briefcase,
  ChevronDown,
  Grid3x3,
  Home,
  MessageSquare,
  Search,
  SquarePlus,
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
  const { role, notifications, referralRequests, seenRequestIds } = useApp()
  const { pathname } = useLocation()
  const me = role === 'requester' ? ME : RECIPIENT

  // Requester: unread status-update notifications. Referrer: incoming referral
  // requests addressed to them that they haven't opened yet.
  const messagingUnread =
    role === 'requester'
      ? notifications.filter((n) => !n.read).length
      : referralRequests.filter(
          (r) => r.recipientId === RECIPIENT.id && !seenRequestIds.includes(r.id),
        ).length

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-line bg-surface">
        {/* Phones: LinkedIn app top bar (avatar, search, messaging) */}
        <div className="flex h-14 items-center gap-3 px-4 md:hidden">
          <span className="shrink-0" aria-hidden>
            <Avatar name={me.name} size={32} />
          </span>
          <label className="relative flex min-w-0 flex-1 items-center">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 text-ink-muted"
            />
            <input
              placeholder="Search"
              aria-label="Search"
              className="w-full rounded-full border border-black/40 bg-surface py-1.5 pl-9 pr-3 text-[15px] outline-none placeholder:text-ink-muted focus:border-accent"
            />
          </label>
          <Link
            to="/messaging"
            aria-label={messagingUnread ? `Messaging, ${messagingUnread} unread` : 'Messaging'}
            className="relative shrink-0 rounded-full p-1 text-ink-muted hover:text-ink"
          >
            <MessageSquare size={24} />
            {messagingUnread ? <Badge count={messagingUnread} /> : null}
          </Link>
        </div>

        {/* Phones: prototype-only role switcher, labelled so it never reads as product UI */}
        <div className="flex items-center justify-between border-t border-line bg-surface-page px-4 py-1 md:hidden">
          <span className="text-[11px] text-ink-faint">Demo control</span>
          <RoleSwitcher />
        </div>

        {/* Tablet and desktop: LinkedIn web top nav */}
        <div className="mx-auto hidden h-[52px] max-w-6xl items-center gap-2 px-4 md:flex">
          {/* Brand mark (non-trademark) + search */}
          <Link to="/" className="flex shrink-0 items-center gap-1" title="LinkedIn Concept · Referral Status">
            <span className="grid h-8 w-8 place-items-center rounded bg-accent text-white">
              <Waypoints size={18} />
            </span>
          </Link>
          <label className="relative hidden items-center lg:flex">
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

      <MobileTabBar role={role} isActive={isActive} />
    </>
  )
}

// Phones: LinkedIn app bottom tab bar. Home and Jobs are live; the rest are
// decorative, like their desktop NavStatic counterparts.
function MobileTabBar({
  role,
  isActive,
}: {
  role: 'requester' | 'referrer'
  isActive: (to: string) => boolean
}) {
  const tabs = [
    { label: 'Home', Icon: Home, to: '/' },
    { label: 'My Network', Icon: Users },
    { label: 'Post', Icon: SquarePlus },
    { label: 'Notifications', Icon: Bell, badge: 7 },
    { label: 'Jobs', Icon: Briefcase, to: role === 'requester' ? '/jobs' : undefined },
  ]

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      {tabs.map(({ label, Icon, to, badge }) => {
        const active = to ? isActive(to) : false
        const inner = (
          <>
            {active && (
              <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-ink" aria-hidden />
            )}
            <span className="relative">
              <Icon size={24} strokeWidth={active ? 2.25 : 1.75} />
              {badge ? <Badge count={badge} /> : null}
            </span>
            <span className="mt-0.5 whitespace-nowrap text-[11px]">{label}</span>
          </>
        )
        const cls = `relative flex min-w-0 flex-1 flex-col items-center justify-center pb-1.5 pt-2 ${
          active ? 'text-ink' : 'text-ink-muted'
        }`
        return to ? (
          <Link key={label} to={to} className={cls} aria-current={active ? 'page' : undefined}>
            {inner}
          </Link>
        ) : (
          <div key={label} className={`${cls} cursor-default`} aria-hidden>
            {inner}
          </div>
        )
      })}
    </nav>
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
      className={`relative flex min-w-[72px] flex-col items-center justify-center border-b-2 px-2 pt-1 text-[11px] transition-colors ${
        active
          ? 'border-ink text-ink'
          : 'border-transparent text-ink-muted hover:text-ink'
      }`}
    >
      <span className="relative">
        {icon}
        {badge ? <Badge count={badge} /> : null}
      </span>
      <span className="mt-0.5 whitespace-nowrap">{label}</span>
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
      className="relative hidden min-w-[72px] cursor-default flex-col items-center justify-center border-b-2 border-transparent px-2 pt-1 text-[11px] text-ink-muted sm:flex"
      aria-hidden
    >
      <span className="relative">
        {icon}
        {badge ? <Badge count={badge} /> : null}
      </span>
      <span className="mt-0.5 flex items-center gap-0.5 whitespace-nowrap">
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
