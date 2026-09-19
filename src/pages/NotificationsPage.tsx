import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { RECIPIENT } from '../sampleData'
import { Avatar } from '../components/Avatar'
import { StatusBadge } from '../components/StatusBadge'
import { formatAge } from '../format'

// Fictional background items so the tab looks lived-in. Always read, not clickable.
const PLACEHOLDERS = [
  { name: 'Priya Menon', text: 'commented on a post you liked: “Deriving state from one log is underrated.”', when: '2h' },
  { name: 'Daniel Okafor', text: 'viewed your profile.', when: '1d' },
  { name: 'Sara Lindqvist', text: 'shared a new role at Spotify: Product Designer.', when: '3d' },
]

// LinkedIn-style Notifications tab. Referral status updates land here (with an
// unread badge on the bell) instead of interrupting the requester with a toast.
export function NotificationsPage() {
  const { role, notifications, referralRequests, statusUpdates, markNotificationRead } = useApp()
  const navigate = useNavigate()

  const items =
    role === 'requester'
      ? [...notifications].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
      : []

  return (
    <div className="animate-fade-in mx-auto max-w-3xl md:px-4 md:py-6">
      <div className="overflow-hidden border-y border-line bg-surface md:rounded-card md:border md:shadow-card">
        <h1 className="border-b border-line px-4 py-3 text-[16px] font-semibold text-ink">
          Notifications
        </h1>
        <ul className="divide-y divide-line">
          {items.map((n) => {
            const request = referralRequests.find((r) => r.id === n.referralRequestId)
            const note = statusUpdates.find((u) => u.id === n.statusUpdateId)?.note
            return (
              <li key={n.id}>
                <button
                  onClick={() => {
                    markNotificationRead(n.id)
                    navigate(`/status/${n.referralRequestId}`)
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors ${
                    n.read ? 'hover:bg-surface-hover' : 'bg-[#eef3f8] hover:bg-[#e3ecf5]'
                  }`}
                >
                  <Avatar name={RECIPIENT.name} size={48} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] leading-snug text-ink">
                      <span className="font-semibold">{RECIPIENT.name}</span> updated your
                      referral request
                      {request ? ` for ${request.jobTitleSnapshot}` : ''}.
                    </p>
                    <div className="mt-1.5">
                      <StatusBadge status={n.status} size="sm" />
                    </div>
                    {note && (
                      <p className="mt-1.5 line-clamp-2 text-[13px] text-ink-muted">“{note}”</p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className="text-[12px] text-ink-muted">{formatAge(n.createdAt)}</span>
                    {!n.read && (
                      <span className="h-2.5 w-2.5 rounded-full bg-accent" aria-label="Unread" />
                    )}
                  </div>
                </button>
              </li>
            )
          })}

          {PLACEHOLDERS.map((p) => (
            <li key={p.name} className="flex cursor-default items-start gap-3 px-4 py-3" aria-hidden>
              <Avatar name={p.name} size={48} />
              <p className="min-w-0 flex-1 text-[14px] leading-snug text-ink">
                <span className="font-semibold">{p.name}</span> {p.text}
              </p>
              <span className="shrink-0 text-[12px] text-ink-muted">{p.when}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
