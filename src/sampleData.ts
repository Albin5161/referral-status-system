import type { LinkedInMember, ThreadMessage } from './types'

// Sample data — PRD §8. Use exactly this scenario (fictional, chosen deliberately).
export const ME: LinkedInMember = { id: 'u1', name: 'Albin Sigi' }
export const RECIPIENT: LinkedInMember = { id: 'u2', name: 'Alex Johnson' } // 2nd-degree connection

export const MEMBERS: LinkedInMember[] = [ME, RECIPIENT]

export const JOB = {
  id: 'job1',
  title: 'UX Designer, Google Cloud',
  company: 'Google',
}

export const DEFAULT_REFERRAL_MESSAGE =
  "Hi! I saw the UX Designer, Google Cloud role at Google and would really appreciate a referral if you think I'd be a good fit."

// A short seed conversation so the thread does not start empty. These are plain
// messages (ThreadMessage), never referral requests.
export const SEED_MESSAGES: ThreadMessage[] = [
  {
    id: 'm1',
    senderId: ME.id,
    body: "Hi Alex — great connecting with you at the design meetup last month!",
    sentAt: '2026-08-28T09:12:00.000Z',
  },
  {
    id: 'm2',
    senderId: RECIPIENT.id,
    body: 'Likewise, Albin. Let me know if there is anything I can help with.',
    sentAt: '2026-08-28T15:40:00.000Z',
  },
]

export function memberName(id: string): string {
  return MEMBERS.find((m) => m.id === id)?.name ?? id
}
