import { Link } from 'react-router-dom'
import { ChevronRight, FileText } from 'lucide-react'
import type { ReferralRequest } from '../types'
import { useApp } from '../context/AppContext'
import { deriveCurrentStatus } from '../stateMachine'
import { StatusBadge } from './StatusBadge'
import { formatDate } from '../format'

// The Referral Request card that appears inline in the Message Thread (PRD §5.8).
// Current status is derived, never stored.
export function ReferralRequestCard({ request }: { request: ReferralRequest }) {
  const { statusUpdates } = useApp()
  const status = deriveCurrentStatus(request, statusUpdates)

  return (
    <div className="rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-start gap-3 p-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded bg-accent/10 text-accent">
          <FileText size={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Referral Request
          </p>
          <p className="truncate text-[15px] font-semibold text-ink">
            {request.jobTitleSnapshot}
          </p>
          <p className="truncate text-[13px] text-ink-muted">
            {request.companySnapshot} · Requested {formatDate(request.createdAt)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[13px] text-ink-muted">Status</span>
            <StatusBadge status={status} size="sm" />
          </div>
        </div>
      </div>
      <Link
        to={`/status/${request.id}`}
        className="flex items-center justify-between border-t border-line px-3 py-2.5 text-sm font-semibold text-accent hover:bg-surface-hover"
      >
        View Referral Status
        <ChevronRight size={16} />
      </Link>
    </div>
  )
}
