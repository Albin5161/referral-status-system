import type { ReferralStatus } from '../types'

// PRD §9: status is communicated through TEXT and position, never through a new
// color-coding scheme. Every status uses the same neutral treatment.
export function StatusBadge({
  status,
  size = 'md',
}: {
  status: ReferralStatus
  size?: 'sm' | 'md'
}) {
  const sizing = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-[13px] px-2.5 py-1'
  return (
    <span
      className={`inline-flex items-center rounded-full border border-line bg-black/[0.04] font-medium text-ink ${sizing}`}
    >
      {status}
    </span>
  )
}
