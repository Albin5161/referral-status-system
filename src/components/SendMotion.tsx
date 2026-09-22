import { Avatar } from './Avatar'

// What the request looks like while it is being sent. The animation is the
// loading state: it plays while the save is in flight, and only finishes once
// the save succeeds. If the save fails, it plays backwards to the review.
//
//   fold    the letter goes into the envelope and it is sealed
//   leave   the save succeeded, so it lifts off toward the thread
//   unfold  the save failed, so it opens back up
export type SendPhase = 'fold' | 'leave' | 'unfold'

// Durations, shared with ComposePage so the timers match the CSS (the
// --send-* custom properties on .env). Unhurried on purpose: sending a referral
// request is rare and it costs something to send, so the seal is worth watching.
export const SEND_MS = { fold: 2000, leave: 950, unfold: 900 } as const

interface Props {
  phase: SendPhase
  recipientName: string
  jobTitle: string
  company: string
  message: string
}

export function SendMotion(props: Props) {
  return (
    <div className="send-stage" data-phase={props.phase} role="status" aria-live="polite">
      <Envelope {...props} />
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

// The request is a letter: the envelope forms around it, the letter drops in,
// the flap closes, and the recipient's initials seal it.
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
