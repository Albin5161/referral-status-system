import {
  CircleCheck,
  CircleDashed,
  CircleMinus,
  CircleSlash,
  Clock,
  Eye,
  type LucideIcon,
} from 'lucide-react'
import type { ReferralStatus } from './types'

// Monochrome status icons. PROJECT_LOG (Session 3) explicitly allows status to
// communicate through "text/icon, not color-coding" — so these render in the
// current ink color, never a semantic hue. They aid recognition without layering
// a color scheme onto the single blue accent.
const ICONS: Record<ReferralStatus, LucideIcon> = {
  Pending: Clock,
  Considering: Eye,
  'No Update Received': CircleDashed,
  Referred: CircleCheck,
  'Unable to Refer': CircleSlash,
  Withdrawn: CircleMinus,
}

export function StatusIcon({
  status,
  size = 16,
  className = '',
}: {
  status: ReferralStatus
  size?: number
  className?: string
}) {
  const Icon = ICONS[status]
  return <Icon size={size} className={className} aria-hidden />
}
