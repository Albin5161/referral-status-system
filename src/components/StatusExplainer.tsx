import type { ReferralStatus } from '../types'

// State-specific copy — PRD §6. Strings are used EXACTLY as written; do not paraphrase.
// Only "No Update Received" has designed explanatory copy. Withdrawn shows a single
// neutral line. All other states show NO explanatory copy (label + timestamp only).
export function StatusExplainer({ status }: { status: ReferralStatus }) {
  if (status === 'No Update Received') {
    return (
      <div className="space-y-1 text-sm text-ink-muted">
        <p>The referrer has not posted a status update yet.</p>
        <p>Your request is still open.</p>
        <p>
          If the referrer updates your request later, this status will
          automatically change.
        </p>
      </div>
    )
  }

  if (status === 'Withdrawn') {
    // No language implying permanence — PRD §6 / §7 provisional note.
    return <p className="text-sm text-ink-muted">This request is now withdrawn.</p>
  }

  // Pending, Considering, Referred, Unable to Refer — intentionally no copy.
  return null
}
