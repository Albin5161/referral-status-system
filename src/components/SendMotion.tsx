import { FileText, Loader2 } from 'lucide-react'
import type { SendStyle } from '../demoPrefs'
import { StatusIcon } from '../statusMeta'
import { Avatar } from './Avatar'

// What the request looks like while it is being sent. The animation is the
// loading state: it plays while the save is in flight, and only finishes once
// the save succeeds. If the save fails, it plays backwards to the review.
//
//   fold    the request closes up (envelope sealed, or card folded)
//   leave   the save succeeded, so it lifts off toward the thread
//   unfold  the save failed, so it opens back up
export type SendPhase = 'fold' | 'leave' | 'unfold'

// Durations, shared with ComposePage so the timers match the CSS.
export const SEND_MS = { fold: 1050, leave: 520, unfold: 560 } as const

interface Props {
  style: SendStyle
  phase: SendPhase
  recipientName: string
  jobTitle: string
  company: string
  message: string
}

export function SendMotion(props: Props) {
  return (
    <div className="send-stage" data-phase={props.phase} role="status" aria-live="polite">
      {props.style === 'envelope' ? <Envelope {...props} /> : <Fold {...props} />}
      <p className="send-caption">{caption(props.phase, props.recipientName)}</p>
    </div>
  )
}

function caption(phase: SendPhase, recipientName: string) {
  const first = recipientName.split(' ')[0]
  if (phase === 'leave') return `Sent to ${first}`
  if (phase === 'unfold') return 'That didn’t go through'
  return `Sending to ${first}…`
}

// ——— Version A: the envelope ———
function Envelope({ phase, recipientName, jobTitle, company }: Props) {
  return (
    <div className="env" data-phase={phase} aria-hidden>
      <div className="env__back" />
      <div className="env__letter">
        <span className="env__letter-label">Referral Request</span>
        <span className="env__letter-title">{jobTitle}</span>
        <span className="env__letter-sub">{company}</span>
        <span className="env__line" />
        <span className="env__line env__line--short" />
      </div>
      <svg className="env__front" viewBox="0 0 232 150" preserveAspectRatio="none">
        <path d="M0 0 L116 82 L232 0 L232 150 L0 150 Z" />
        <path className="env__crease" d="M0 150 L96 68 M232 150 L136 68" />
      </svg>
      <div className="env__flap" />
      <span className="env__seal">
        <Avatar name={recipientName} size={30} />
      </span>
    </div>
  )
}

// ——— Version B: the fold ———
// The review closes up into the same card that will sit in the thread.
function Fold({ phase, recipientName, jobTitle, company, message }: Props) {
  const sent = phase === 'leave'
  return (
    <div className="fold" data-phase={phase} aria-hidden>
      <div className="fold__head">
        <span className="fold__icon">
          <FileText size={16} />
        </span>
        <span className="min-w-0">
          <span className="fold__label">Referral Request</span>
          <span className="fold__title">{jobTitle}</span>
          <span className="fold__sub">
            {company} · To {recipientName}
          </span>
        </span>
      </div>
      {/* Each collapsing row wraps a bare div: a row can't shrink past padding */}
      <div className="fold__body">
        <div>
          <p>{message}</p>
        </div>
      </div>
      <div className="fold__statuswrap">
        <div>
          <div className="fold__status">
            <span className="text-[12px] text-ink-muted">Status</span>
            <span className="fold__pill" key={sent ? 'sent' : 'sending'}>
              {sent ? (
                <StatusIcon status="Pending" size={12} className="text-ink-muted" />
              ) : (
                <Loader2 size={12} className="animate-spin text-ink-muted" />
              )}
              {sent ? 'Sent' : 'Sending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
