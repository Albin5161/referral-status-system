// Object model — PRD §2. This is the contract; do not deviate.

export interface LinkedInMember {
  id: string
  name: string
}

export type ReferralStatus =
  | 'Pending'
  | 'Considering'
  | 'No Update Received'
  | 'Referred'
  | 'Unable to Refer'
  | 'Withdrawn' // terminal for THIS prototype only — see PRD §6/§7 provisional note

export interface StatusUpdate {
  id: string
  referralRequestId: string
  newStatus: ReferralStatus
  changedBy: string // LinkedIn Member name, or "system" for the auto-created initial Pending update
  changedAt: string // ISO timestamp
  note?: string // optional, referrer-authored
}

export interface ReferralRequest {
  id: string
  requesterId: string // LinkedInMember.id
  recipientId: string // LinkedInMember.id
  jobPostingId: string // external reference
  jobTitleSnapshot: string // captured at creation, for display resilience
  companySnapshot: string // captured at creation, for display resilience
  initialMessage: string
  createdAt: string
  // currentStatus is NEVER stored — always derive from the latest StatusUpdate (PRD §2)
}

// A plain conversation message in the thread (not a referral request).
export interface ThreadMessage {
  id: string
  senderId: string
  body: string
  sentAt: string
}

export type Role = 'requester' | 'referrer'
