import { Link } from 'react-router-dom'
import { ChevronRight, FileText, Paperclip } from 'lucide-react'
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
    <div className="animate-pop-in overflow-hidden rounded-card border border-line bg-surface shadow-card transition-shadow duration-200 hover:shadow-cardHover">
      <div className="flex items-start gap-3 p-3.5">
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
          {request.resumeName && (
            <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-black/[0.02] px-2.5 py-1 text-[12px] text-ink-muted">
              <Paperclip size={12} className="shrink-0" />
              <span className="truncate">{request.resumeName}</span>
            </div>
          )}
        </div>
      </div>
      <Link
        to={`/status/${request.id}`}
        className="group flex items-center justify-between border-t border-line px-3.5 py-2.5 text-sm font-semibold text-accent transition-colors hover:bg-accent/5"
      >
        View Referral Status
        <ChevronRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        />
      </Link>
    </div>
  )
}
