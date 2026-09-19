import type { ReferralStatus } from '../types'
import { StatusIcon, statusLabel } from '../statusMeta'

// PRD §9: status is communicated through TEXT (and monochrome icon), never through
// a new color-coding scheme. Every status uses the same neutral treatment.
export function StatusBadge({
  status,
  size = 'md',
}: {
  status: ReferralStatus
  size?: 'sm' | 'md'
}) {
  const sizing = size === 'sm' ? 'text-xs px-2 py-0.5 gap-1' : 'text-[13px] px-2.5 py-1 gap-1.5'
  return (
    <span
      className={`inline-flex items-center rounded-full border border-line bg-black/[0.04] font-medium text-ink ${sizing}`}
    >
      <StatusIcon status={status} size={size === 'sm' ? 12 : 14} className="text-ink-muted" />
      {statusLabel(status)}
    </span>
  )
}
