import { Link } from 'react-router-dom'
import { Briefcase, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { deriveCurrentStatus } from '../stateMachine'
import { StatusBadge } from '../components/StatusBadge'
import { formatDate } from '../format'

// My Jobs — PRD §4 item 5. Requester's list of all their Referral Requests.
export function MyJobsPage() {
  const { referralRequests, statusUpdates } = useApp()

  // Newest first.
  const rows = [...referralRequests].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-4">
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        <div className="border-b border-line px-4 py-3">
          <h1 className="text-[15px] font-semibold text-ink">My Jobs</h1>
          <p className="text-[13px] text-ink-muted">Your referral requests</p>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-ink-muted">
              You haven&apos;t sent any referral requests yet.
            </p>
            <Link
              to="/messaging"
              className="mt-3 inline-block text-sm font-semibold text-accent"
            >
              Go to messaging to start one
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {rows.map((r) => {
              const status = deriveCurrentStatus(r, statusUpdates)
              return (
                <li key={r.id}>
                  <Link
                    to={`/status/${r.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-surface-hover"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded bg-accent/10 text-accent">
                      <Briefcase size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-semibold text-ink">
                        {r.jobTitleSnapshot}
                      </p>
                      <p className="truncate text-[13px] text-ink-muted">
                        {r.companySnapshot} · Requested {formatDate(r.createdAt)}
                      </p>
                    </div>
                    <StatusBadge status={status} size="sm" />
                    <ChevronRight size={16} className="shrink-0 text-ink-faint" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
