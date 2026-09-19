import { Link } from 'react-router-dom'
import { ArrowLeft, Briefcase, ChevronRight } from 'lucide-react'
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
    <div className="animate-fade-in mx-auto max-w-3xl md:px-4 md:py-4">
      <div className="overflow-hidden border-y border-line bg-surface md:rounded-card md:border md:shadow-card">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          {/* Phones: full-screen page, so it needs its own way back */}
          <Link
            to="/"
            aria-label="Back to Home"
            className="-ml-1 rounded-full p-1 text-ink-muted hover:bg-black/5 hover:text-ink md:hidden"
          >
            <ArrowLeft size={22} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-[15px] font-semibold text-ink">My Jobs</h1>
            <p className="text-[13px] text-ink-muted">Your referral requests</p>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center">
            <p className="text-sm text-ink-muted">
              You haven&apos;t asked anyone for a referral yet. When you do, you can follow each one here.
            </p>
            <Link
              to="/jobs"
              className="mt-3 inline-block text-sm font-semibold text-accent"
            >
              Find someone to ask in your Job Tracker
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
