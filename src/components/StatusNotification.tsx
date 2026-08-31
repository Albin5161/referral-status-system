import { useNavigate } from 'react-router-dom'
import { Bell, X } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Status Notification — PRD §4 item 6. A banner/toast (not a page) shown to the
// REQUESTER when the referrer posts a Status Update. Clicking opens Referral Status.
export function StatusNotification() {
  const { role, notifications, dismissNotification, markNotificationRead } = useApp()
  const navigate = useNavigate()

  if (role !== 'requester') return null

  const unread = notifications.filter((n) => !n.read)
  if (unread.length === 0) return null

  const latest = unread[unread.length - 1]

  const open = () => {
    markNotificationRead(latest.id)
    navigate(`/status/${latest.referralRequestId}`)
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex w-full max-w-md items-start gap-3 rounded-card border border-line bg-surface p-3 shadow-pop">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent/10 text-accent">
          <Bell size={16} />
        </span>
        <button onClick={open} className="min-w-0 flex-1 text-left">
          <p className="text-sm font-semibold text-ink">
            Your referral status was updated
          </p>
          <p className="truncate text-[13px] text-ink-muted">
            New status: {latest.status} — tap to view
          </p>
        </button>
        <button
          onClick={() => dismissNotification(latest.id)}
          aria-label="Dismiss notification"
          className="rounded-full p-1 text-ink-faint hover:bg-black/5 hover:text-ink"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
