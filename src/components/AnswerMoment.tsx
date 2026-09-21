import { CircleMinus, Eye, Heart, MessageSquare } from 'lucide-react'
import type { ReferralStatus } from '../types'
import { Avatar } from './Avatar'

// The moment right after someone answers. The feature's goal is an answer, any
// answer, so every answer is thanked. What changes is the feeling:
//
//   Looking into it  an eye travels across: they know you're on it
//   Referred         the two people come together, a hug, with a heart
//   Can't refer      a note travels across, calm, no celebration
//   Withdrawn        the same calm, travelling the other way
//
// One shared idea holds them together: your answer travels to the other
// person. Referred is the only one where the two actually meet.
type Answer = Extract<ReferralStatus, 'Considering' | 'Referred' | 'Unable to Refer' | 'Withdrawn'>

export function isAnswer(status: ReferralStatus): status is Answer {
  return status !== 'Pending' && status !== 'No Update Received'
}

interface Props {
  status: Answer
  from: string // who answered, shown on the left
  to: string // who hears about it, on the right
}

const first = (name: string) => name.split(' ')[0]

function words(status: Answer, to: string) {
  const name = first(to)
  switch (status) {
    case 'Considering':
      return { title: `${name} knows you're on it`, body: 'No rush. You can update it again once you’ve decided.' }
    case 'Referred':
      return { title: `You referred ${name}`, body: `That’s a real favour. ${name} has been told straight away.` }
    case 'Unable to Refer':
      return { title: `Thanks for letting ${name} know`, body: `A clear answer lets ${name} move on and ask someone else.` }
    case 'Withdrawn':
      return { title: 'Request withdrawn', body: `${name} won’t need to do anything more.` }
  }
}

const TOKEN: Record<Exclude<Answer, 'Referred'>, typeof Eye> = {
  Considering: Eye,
  'Unable to Refer': MessageSquare,
  Withdrawn: CircleMinus,
}

export function AnswerMoment({ status, from, to }: Props) {
  const { title, body } = words(status, to)
  const hug = status === 'Referred'
  const Token = hug ? null : TOKEN[status]

  return (
    <div className="moment" data-status={status} role="status" aria-live="polite">
      <div className="moment__stage" aria-hidden>
        <span className="moment__a">
          <Avatar name={from} size={40} />
        </span>
        {hug ? (
          <span className="moment__hearts">
            <Heart className="moment__heart" size={18} />
            <Heart className="moment__heart moment__heart--small" size={11} />
            <Heart className="moment__heart moment__heart--tiny" size={9} />
          </span>
        ) : (
          <>
            <svg className="moment__path" viewBox="0 0 100 2" preserveAspectRatio="none">
              <line x1="0" y1="1" x2="100" y2="1" pathLength={1} />
            </svg>
            <span className="moment__token">{Token && <Token size={14} />}</span>
          </>
        )}
        <span className="moment__b">
          <Avatar name={to} size={40} />
          {Token && (
            <span className="moment__badge">
              <Token size={10} />
            </span>
          )}
        </span>
      </div>
      <div className="moment__words">
        <p className="moment__title">{title}</p>
        <p className="moment__body">{body}</p>
      </div>
    </div>
  )
}
