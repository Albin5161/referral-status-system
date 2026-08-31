import type { ReferralRequest, ReferralStatus, StatusUpdate } from './types'

// State machine — PRD §3. Enforce exactly. This gates which UI actions are offered.
// system-inferred states are reversible; a later human action always overrides them.
export const ALLOWED_TRANSITIONS: Record<ReferralStatus, ReferralStatus[]> = {
  Pending: ['Considering', 'No Update Received', 'Referred', 'Unable to Refer'],
  Considering: ['No Update Received', 'Referred', 'Unable to Refer'],
  'No Update Received': ['Considering', 'Referred', 'Unable to Refer'], // reversible by design
  Referred: [], // terminal
  'Unable to Refer': [], // terminal
  Withdrawn: [], // terminal for this prototype — PROVISIONAL, see PRD §6/§7
}

export function allowedTransitions(status: ReferralStatus): ReferralStatus[] {
  return ALLOWED_TRANSITIONS[status]
}

export function isTerminal(status: ReferralStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0
}

// Deriving current status — PRD §2. currentStatus is NEVER stored.
// Take the latest StatusUpdate (by changedAt) for this request.
export function deriveCurrentUpdate(
  request: ReferralRequest,
  updates: StatusUpdate[],
): StatusUpdate | undefined {
  return updates
    .filter((su) => su.referralRequestId === request.id)
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
    .at(-1)
}

export function deriveCurrentStatus(
  request: ReferralRequest,
  updates: StatusUpdate[],
): ReferralStatus {
  return deriveCurrentUpdate(request, updates)?.newStatus ?? 'Pending'
}

// Full ordered history (oldest first) for a request.
export function historyFor(
  request: ReferralRequest,
  updates: StatusUpdate[],
): StatusUpdate[] {
  return updates
    .filter((su) => su.referralRequestId === request.id)
    .sort((a, b) => new Date(a.changedAt).getTime() - new Date(b.changedAt).getTime())
}
