import type { ReferralStatus } from '../types'
import { useApp } from '../context/AppContext'
import { statusMeaning } from '../statusMeta'

// One plain sentence under the current status saying what it means for the
// person looking at it. Every status gets one, so nobody has to guess.
export function StatusExplainer({ status }: { status: ReferralStatus }) {
  const { role, members } = useApp()
  return (
    <p className="text-sm leading-relaxed text-ink-muted">
      {statusMeaning(status, role, {
        requester: members.me.name,
        referrer: members.recipient.name,
      })}
    </p>
  )
}
