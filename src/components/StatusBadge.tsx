import type { ReferralStatus } from '../types'
import { StatusIcon, statusLabel, statusTone } from '../statusMeta'

// A status tag in LinkedIn's Job tracker style: a small rounded rectangle with
// no border, green while the request is live or has good news, grey once it is
// quiet or closed. The word and the icon always carry the meaning; the colour
// only reinforces it.
export function StatusBadge({
  status,
  size = 'md',
}: {
  status: ReferralStatus
  size?: 'sm' | 'md'
}) {
  const sizing = size === 'sm' ? 'text-xs px-1.5 py-0.5 gap-1' : 'text-[13px] px-2 py-1 gap-1.5'
  const tone =
    statusTone(status) === 'positive' ? 'bg-positive-tint text-positive-ink' : 'bg-black/[0.06] text-ink-action'
  return (
    <span className={`inline-flex items-center rounded font-semibold ${tone} ${sizing}`}>
      <StatusIcon status={status} size={size === 'sm' ? 12 : 14} />
      {statusLabel(status)}
    </span>
  )
}
