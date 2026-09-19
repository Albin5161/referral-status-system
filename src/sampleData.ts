import type { LinkedInMember, ThreadMessage, TrackedJob } from './types'

// Sample data — PRD §8. The canonical scenario (Alex Johnson + the Google job +
// default message) is preserved. Entry Point 2 (Job Tracker →
// Refer, PRD §4b) needs more than one connection and job, so this file also
// defines the requester's connections and a small Job Tracker list.
export const ME: LinkedInMember = { id: 'u1', name: 'Albin Sigi' }

// The requester's connections. Each can be a referral recipient.
export const CONNECTIONS: LinkedInMember[] = [
  { id: 'u2', name: 'Alex Johnson', headline: 'Design Manager · Google', degree: '2nd' },
  { id: 'u3', name: 'Priya Menon', headline: 'Product Designer · Figma', degree: '1st' },
  { id: 'u4', name: 'Daniel Okafor', headline: 'Engineering Manager · Stripe', degree: '2nd' },
  { id: 'u5', name: 'Sara Lindqvist', headline: 'Design Lead · Spotify', degree: '2nd' },
]

// Back-compat with the canonical PRD scenario (Entry Point 1).
export const RECIPIENT = CONNECTIONS[0] // Alex Johnson, a 2nd-degree connection

export const MEMBERS: LinkedInMember[] = [ME, ...CONNECTIONS]

// Job Tracker list — PRD §4b. Each row may show connection avatars for that
// company; the last row deliberately has zero connections to exercise the muted
// "No connections at [Company] yet" state.
export const JOBS: TrackedJob[] = [
  {
    id: 'job1',
    title: 'UX Designer, Google Cloud',
    company: 'Google',
    trackStatus: 'Applied',
    connectionIds: ['u2'],
  },
  {
    id: 'job2',
    title: 'Senior Product Designer',
    company: 'Figma',
    trackStatus: 'In Progress',
    connectionIds: ['u3'],
  },
  {
    id: 'job3',
    title: 'Design Systems Lead',
    company: 'Stripe',
    trackStatus: 'Applied',
    connectionIds: ['u4'],
  },
  {
    id: 'job4',
    title: 'Product Designer',
    company: 'Spotify',
    trackStatus: 'Saved',
    connectionIds: ['u5'],
  },
  {
    id: 'job5',
    title: 'UX Researcher',
    company: 'Netflix',
    trackStatus: 'Applied',
    connectionIds: [], // zero connections → muted affordance (PRD §4b step 3)
  },
]

// Back-compat: the single hardcoded job referenced by Entry Point 1 / PRD §8.
export const JOB = { id: JOBS[0].id, title: JOBS[0].title, company: JOBS[0].company }


// Mock resume filename used by the optional resume attachment (no real upload).
export const DEFAULT_RESUME = 'Albin_Sigi_Resume.pdf'

// The prefilled referral message, templated per job and person. Written to sound
// like a person asking a favour: warm, specific, and easy to say no to.
export function defaultReferralMessage(
  job: { title: string; company: string },
  recipientName: string,
): string {
  const first = recipientName.split(' ')[0]
  return `Hi ${first}, I hope you’re doing well! I’ve applied for the ${job.title} role at ${job.company} and I’m really excited about it. Would you be comfortable referring me? No pressure at all if not. I’ve attached my resume in case it helps. Thank you so much!`
}

// A short seed conversation so the Alex thread does not start empty. These are
// plain messages (ThreadMessage), never referral requests. peerId scopes them to
// the Alex Johnson conversation.
export const SEED_MESSAGES: ThreadMessage[] = [
  {
    id: 'm1',
    senderId: ME.id,
    peerId: RECIPIENT.id,
    body: "Hi Alex — great connecting with you at the design meetup last month!",
    sentAt: '2026-08-28T09:12:00.000Z',
  },
  {
    id: 'm2',
    senderId: RECIPIENT.id,
    peerId: RECIPIENT.id,
    body: 'Likewise, Albin. Let me know if there is anything I can help with.',
    sentAt: '2026-08-28T15:40:00.000Z',
  },
]

export function memberName(id: string): string {
  return MEMBERS.find((m) => m.id === id)?.name ?? id
}

export function memberById(id: string): LinkedInMember | undefined {
  return MEMBERS.find((m) => m.id === id)
}

export function jobById(id: string): TrackedJob | undefined {
  return JOBS.find((j) => j.id === id)
}
