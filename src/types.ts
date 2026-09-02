// Object model — PRD §2. This is the contract; do not deviate.

export interface LinkedInMember {
  id: string
  name: string
  // Optional profile fields used by the connection picker / Job Tracker (PRD §4b).
  headline?: string
  degree?: string // e.g. "1st", "2nd"
}

// A row in the requester's Job Tracker (PRD §4b). Not part of the object-model
// contract (§2) — it is presentation context for Entry Point 2.
export interface TrackedJob {
  id: string
  title: string
  company: string
  trackStatus: 'Saved' | 'Applied' | 'In Progress'
  connectionIds: string[] // members the requester is connected to at this company
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
  peerId: string // the OTHER member in this 1:1 conversation (scopes the thread)
  body: string
  sentAt: string
}

export type Role = 'requester' | 'referrer'
