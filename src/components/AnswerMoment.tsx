import { CircleMinus, Eye, MessageSquare } from 'lucide-react'
import type { ReferralStatus } from '../types'
import { Avatar } from './Avatar'

// The moment right after someone answers. The feature's goal is an answer, any
// answer, so every answer is thanked. What changes is the feeling:
//
//   Looking into it  an eye travels across: they know you're on it
//   Referred         the referrer's name is stamped onto the application
//   Can't refer      a note travels across, calm, no celebration
//   Withdrawn        the same calm, travelling the other way
//
// One shared idea holds them together: your answer travels to the other
// person. Referred is different because a referral is vouching: the referrer
// puts their name behind someone. So instead of travelling, their name lands
// on the application, and LinkedIn's own success badge confirms it.
type Answer = Extract<ReferralStatus, 'Considering' | 'Referred' | 'Unable to Refer' | 'Withdrawn'>

export function isAnswer(status: ReferralStatus): status is Answer {
  return status !== 'Pending' && status !== 'No Update Received'
}

interface Props {
  status: Answer
  from: string // who answered, shown on the left
  to: string // who hears about it, on the right
  job: string // the role, shown on the application in the Referred moment
}

const first = (name: string) => name.split(' ')[0]

function words(status: Answer, to: string) {
  const name = first(to)
  switch (status) {
    case 'Considering':
      return { title: `${name} knows you're on it`, body: 'No rush. You can update it again once you’ve decided.' }
    case 'Referred':
      return { title: `You referred ${name}`, body: `You’ve put your name behind ${name}, and ${name} has been told straight away.` }
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

export function AnswerMoment({ status, from, to, job }: Props) {
  const { title, body } = words(status, to)
  const vouch = status === 'Referred'
  const Token = vouch ? null : TOKEN[status]

  return (
    <div className="moment" data-status={status} role="status" aria-live="polite">
      {vouch ? (
        <Vouch from={from} to={to} job={job} />
      ) : (
        <div className="moment__stage" aria-hidden>
          <span className="moment__a">
            <Avatar name={from} size={40} />
          </span>
          <svg className="moment__path" viewBox="0 0 100 2" preserveAspectRatio="none">
            <line x1="0" y1="1" x2="100" y2="1" pathLength={1} />
          </svg>
          <span className="moment__token">{Token && <Token size={14} />}</span>
          <span className="moment__b">
            <Avatar name={to} size={40} />
            {Token && (
              <span className="moment__badge">
                <Token size={10} />
              </span>
            )}
          </span>
        </div>
      )}
      <div className="moment__words">
        <p className="moment__title">{title}</p>
        <p className="moment__body">{body}</p>
      </div>
    </div>
  )
}

// Referred: the referrer's name is stamped onto the requester's application,
// then LinkedIn's sage success badge (the one on "You're all set" and "Post
// successful") confirms it. Drawn here in code; no LinkedIn artwork is used.
function Vouch({ from, to, job }: { from: string; to: string; job: string }) {
  return (
    <div className="vouch" aria-hidden>
      <div className="vouch__card">
        <Avatar name={to} size={36} />
        <span className="vouch__who">
          <span className="vouch__name">{to}</span>
          <span className="vouch__job">{job}</span>
        </span>
        <svg className="vouch__badge" viewBox="0 0 28 28">
          <circle className="vouch__ring" cx="14" cy="14" r="13" />
          <circle className="vouch__disc" cx="14" cy="14" r="9.5" />
          <path className="vouch__tick" d="m9.8 14.2 2.9 2.9 5.6-5.8" />
        </svg>
      </div>
      <span className="vouch__stamp">
        <Avatar name={from} size={18} />
        Referred by {from}
      </span>
    </div>
  )
}
