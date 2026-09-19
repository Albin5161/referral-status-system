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

// Display labels. The stored enum (PRD §2) never changes; these are the words
// people read. Plain, human phrasing tested better than system jargon.
const LABELS: Record<ReferralStatus, string> = {
  Pending: 'Sent',
  Considering: 'Looking into it',
  'No Update Received': 'No reply yet',
  Referred: 'Referred',
  'Unable to Refer': 'Can’t refer',
  Withdrawn: 'Withdrawn',
}

export function statusLabel(status: ReferralStatus): string {
  return LABELS[status]
}

const firstName = (name: string) => name.split(' ')[0]

// What the current status means, written for whoever is looking at it.
export function statusMeaning(
  status: ReferralStatus,
  viewer: 'requester' | 'referrer',
  names: { requester: string; referrer: string },
): string {
  const referrer = firstName(names.referrer)
  const requester = firstName(names.requester)
  if (viewer === 'requester') {
    switch (status) {
      case 'Pending':
        return `Your request is with ${referrer}. People are busy, so it can take a few days. We’ll let you know as soon as anything changes, so there’s no need to follow up.`
      case 'Considering':
        return `${referrer} has seen your request and is looking into it, maybe checking the role or talking to the team. We’ll let you know when there’s news.`
      case 'No Update Received':
        return `${referrer} hasn’t updated this yet, and your request is still open. If they respond later, you’ll see it here straight away.`
      case 'Referred':
        return `${referrer} has referred you for this role. The hiring team may reach out to you directly. It could be a nice moment to say thank you.`
      case 'Unable to Refer':
        return `${referrer} can’t refer you for this one. That usually comes down to timing or company rules, not you. It’s still worth applying directly, and you can ask someone else too.`
      case 'Withdrawn':
        return `You withdrew this request, so ${referrer} doesn’t need to do anything.`
    }
  }
  switch (status) {
    case 'Pending':
      return `${requester} is waiting to hear from you. Pick an option below to let them know where things stand.`
    case 'Considering':
      return `${requester} knows you’re looking into it. Update it again once you’ve decided.`
    case 'No Update Received':
      return `${requester} sees “No reply yet”. Any update you post replaces it.`
    case 'Referred':
      return `${requester} has been told you referred them.`
    case 'Unable to Refer':
      return `${requester} has been told, kindly, that you can’t refer them this time.`
    case 'Withdrawn':
      return `${requester} withdrew this request. Nothing more to do.`
  }
}

// The referrer's choices, phrased as what they're saying to the requester.
// "No Update Received" is deliberately absent: it describes the referrer's
// silence, so only the system infers it; a person never picks it.
export function referrerChoice(
  status: ReferralStatus,
  requesterName: string,
): { label: string; hint: string } | null {
  const requester = firstName(requesterName)
  switch (status) {
    case 'Considering':
      return {
        label: 'I’m looking into it',
        hint: `${requester} will know you’ve seen it. You can update it again later.`,
      }
    case 'Referred':
      return { label: `I’ve referred ${requester}`, hint: `Final. ${requester} is notified straight away.` }
    case 'Unable to Refer':
      return {
        label: 'I can’t refer this time',
        hint: `Final. ${requester} gets a kind message, and you can add a note of your own.`,
      }
    default:
      return null
  }
}
