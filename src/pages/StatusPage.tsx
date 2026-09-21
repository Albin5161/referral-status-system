import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, Check, Paperclip } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useTour } from '../context/TourContext'
import {
  allowedTransitions,
  deriveCurrentStatus,
  historyFor,
  isTerminal,
} from '../stateMachine'
import { ME, RECIPIENT } from '../sampleData'
import type { ReferralStatus } from '../types'
import { StatusExplainer } from '../components/StatusExplainer'
import { Button } from '../components/Button'
import { StatusIcon, referrerChoice, statusLabel, statusTone } from '../statusMeta'
import { displayActor, formatDate, formatTimestamp } from '../format'
import { useStatusTransition } from '../useStatusTransition'
import { AnswerMoment, isAnswer } from '../components/AnswerMoment'

export function StatusPage() {
  const { id } = useParams<{ id: string }>()
  const { role, referralRequests, statusUpdates, markRequestsSeen, notifications, markNotificationRead } =
    useApp()
  const navigate = useNavigate()

  // The moment right after someone answers (visibility of system status). Lifted
  // here so it survives the action's own state change: a final answer unmounts
  // the referrer's options, and Withdraw unmounts the requester's action.
  // Final answers keep their moment. Looking into it fades, because the
  // referrer still has a decision to make underneath it.
  const [moment, setMoment] = useState<{ status: ReferralStatus; key: number } | null>(null)
  const momentTimer = useRef<number | null>(null)
  const showMoment = useCallback((status: ReferralStatus) => {
    setMoment({ status, key: Date.now() })
    if (momentTimer.current) window.clearTimeout(momentTimer.current)
    if (!isTerminal(status)) momentTimer.current = window.setTimeout(() => setMoment(null), 4200)
  }, [])
  useEffect(
    () => () => {
      if (momentTimer.current) window.clearTimeout(momentTimer.current)
    },
    [],
  )

  const request = referralRequests.find((r) => r.id === id)
  const history = request ? historyFor(request, statusUpdates) : []
  const transition = useStatusTransition(role, id, history)

  // Test journey ends when the requester sees a status the referrer set.
  const { markOutcomeSeen } = useTour()
  const referrerResponded = statusUpdates.some(
    (u) => u.referralRequestId === id && u.changedBy === RECIPIENT.name,
  )
  useEffect(() => {
    if (role === 'requester' && referrerResponded) markOutcomeSeen()
  }, [role, referrerResponded, markOutcomeSeen])

  // Seeing the status here counts as reading its notifications, however the
  // requester got here.
  useEffect(() => {
    if (role !== 'requester') return
    notifications
      .filter((n) => n.referralRequestId === id && !n.read)
      .forEach((n) => markNotificationRead(n.id))
  }, [role, id, notifications, markNotificationRead])

  // Referrer opening a request's detail marks it seen (clears the Messaging badge).
  useEffect(() => {
    if (role === 'referrer' && request) markRequestsSeen([request.id])
  }, [role, request, markRequestsSeen])

  if (!request) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-center">
        <p className="text-sm text-ink-muted">This referral request was not found.</p>
        <Link
          to="/messaging"
          className="mt-3 inline-block text-sm font-semibold text-accent"
        >
          Back to messaging
        </Link>
      </div>
    )
  }

  const status = deriveCurrentStatus(request, statusUpdates)
  const latest = history.at(-1)
  // Oldest unseen entry first, so the history fills in the order it happened.
  const unseenOrder = history.filter((u) => transition.unseenIds.has(u.id)).map((u) => u.id)
  const timing = motionTiming(transition.live)

  return (
    <div className="animate-fade-in mx-auto max-w-3xl md:px-4 md:py-4">
      <div className="overflow-hidden border-y border-line bg-surface md:rounded-card md:border md:shadow-card">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <button
            onClick={() => navigate('/messaging')}
            aria-label="Back"
            className="rounded-full p-1 text-ink-muted hover:bg-black/5 hover:text-ink"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[15px] font-semibold text-ink">Referral Status</h1>
        </div>

        {/* Job summary */}
        <div className="flex items-start gap-3 border-b border-line px-4 py-4">
          <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded bg-accent/10 text-accent">
            <Briefcase size={20} />
          </span>
          <div className="min-w-0">
            <p className="text-[16px] font-semibold text-ink">
              {request.jobTitleSnapshot}
            </p>
            <p className="text-[13px] text-ink-muted">
              {request.companySnapshot} · Requested {formatDate(request.createdAt)}
            </p>
            {request.resumeName && (
              <div className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-black/[0.02] px-2.5 py-1 text-[12px] text-ink-muted">
                <Paperclip size={12} className="shrink-0" />
                <span className="truncate">{request.resumeName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Current status — the hero of this page */}
        <div className="border-b border-line px-4 py-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            Current status
          </p>
          <StatusHero
            key={latest?.id}
            status={status}
            from={transition.from?.newStatus}
            live={transition.live}
            updatedAt={latest?.changedAt ?? request.createdAt}
          />

          {/* Role-specific actions */}
          {role === 'requester' ? (
            <RequesterActions
              requestId={request.id}
              status={status}
              onDone={showMoment}
            />
          ) : (
            <ReferrerActions
              requestId={request.id}
              status={status}
              onDone={showMoment}
              showClosed={!moment}
            />
          )}

          {moment && isAnswer(moment.status) && (
            <AnswerMoment
              key={moment.key}
              status={moment.status}
              // Withdraw travels from the requester; every other answer from the referrer
              from={moment.status === 'Withdrawn' ? ME.name : RECIPIENT.name}
              to={moment.status === 'Withdrawn' ? RECIPIENT.name : ME.name}
              job={request.jobTitleSnapshot}
            />
          )}
        </div>

        {/* Full history */}
        <div className="px-4 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            History
          </p>
          <ol className="space-y-1">
            {[...history].reverse().map((su, idx) => {
              const newest = idx === 0
              const isLast = idx === history.length - 1
              // Unseen entries arrive after the hero has changed, oldest first.
              const order = unseenOrder.indexOf(su.id)
              const delay = order === -1 ? null : timing.entry + order * timing.stagger
              return (
                <li
                  key={su.id}
                  className={`grid ${delay === null ? '' : 'animate-entry-expand'}`}
                  style={delay === null ? undefined : { animationDelay: `${delay}ms` }}
                >
                <div
                  className={`flex min-h-0 gap-3 overflow-hidden ${delay === null ? '' : 'animate-entry-in'}`}
                  style={delay === null ? undefined : { animationDelay: `${delay + 60}ms` }}
                >
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition-colors duration-300 ${
                        !newest
                          ? 'bg-black/[0.05] text-ink-muted'
                          : statusTone(su.newStatus) === 'positive'
                            ? 'bg-positive-tint text-positive-ink'
                            : 'bg-black/[0.08] text-ink-action'
                      }`}
                    >
                      <StatusIcon status={su.newStatus} size={15} />
                    </span>
                    {!isLast && (
                      <span
                        className={`my-1 w-px flex-1 origin-top bg-line ${delay === null ? '' : 'animate-grow'}`}
                        style={delay === null ? undefined : { animationDelay: `${delay + 160}ms` }}
                      />
                    )}
                  </div>
                  <div className="pb-4 pt-0.5">
                    <p className="text-sm font-semibold text-ink">{statusLabel(su.newStatus)}</p>
                    <p className="text-[12px] text-ink-muted">
                      {displayActor(su.changedBy)} · {formatTimestamp(su.changedAt)}
                    </p>
                    {su.note && (
                      <p className="mt-1.5 rounded-card border border-line bg-surface-hover px-2.5 py-1.5 text-[13px] text-ink">
                        “{su.note}”
                      </p>
                    )}
                  </div>
                </div>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

// Requester: Withdraw (available while the request is still active/non-terminal).
function RequesterActions({
  requestId,
  status,
  onDone,
}: {
  requestId: string
  status: ReferralStatus
  onDone: (status: ReferralStatus) => void
}) {
  const { postStatusUpdate, members } = useApp()
  const [confirming, setConfirming] = useState(false)

  if (isTerminal(status)) return null

  return (
    <div className="mt-4">
      {!confirming ? (
        <Button variant="secondary" onClick={() => setConfirming(true)}>
          Withdraw request
        </Button>
      ) : (
        <div className="animate-fade-in flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-hover px-3 py-2.5">
          <span className="text-[13px] text-ink">
            Withdraw this request? {RECIPIENT.name.split(' ')[0]} won’t need to do anything
            more.
          </span>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Keep it
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                postStatusUpdate(requestId, 'Withdrawn', members.me.name)
                onDone('Withdrawn')
              }}
            >
              Withdraw
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// Referrer: Update Status — options derived ONLY from ALLOWED_TRANSITIONS (PRD §3/§11).
function ReferrerActions({
  requestId,
  status,
  onDone,
  showClosed,
}: {
  requestId: string
  status: ReferralStatus
  onDone: (status: ReferralStatus) => void
  showClosed: boolean // hidden while the answer's own moment is on screen
}) {
  const { postStatusUpdate } = useApp()
  // "No Update Received" is system-inferred only, never a manual choice.
  const options = allowedTransitions(status).filter((s) => referrerChoice(s, ME.name))
  const [selected, setSelected] = useState<ReferralStatus | ''>('')
  const [note, setNote] = useState('')
  // FIX 1: terminal statuses (Referred / Unable to Refer) are irreversible, so
  // they get an inline confirm before posting — matching Withdraw / Send.
  const [confirmingTerminal, setConfirmingTerminal] = useState(false)

  // Empty transition array → no status-change action renders at all (PRD §3).
  if (options.length === 0) {
    if (!showClosed) return null
    return (
      <div className="mt-4 rounded-card border border-line bg-surface-hover px-3 py-2.5">
        <p className="text-[13px] text-ink-muted">
          Nothing more to do here. This request is closed.
        </p>
      </div>
    )
  }

  const post = () => {
    if (!selected) return
    postStatusUpdate(requestId, selected, RECIPIENT.name, note)
    onDone(selected)
    setSelected('')
    setNote('')
    setConfirmingTerminal(false)
  }

  const handlePost = () => {
    if (!selected) return
    // Terminal selections need a confirmation step; reversible ones don't.
    if (isTerminal(selected) && !confirmingTerminal) {
      setConfirmingTerminal(true)
      return
    }
    post()
  }

  const selectOption = (opt: ReferralStatus) => {
    setSelected(opt)
    setConfirmingTerminal(false)
  }

  return (
    <div className="mt-4 rounded-card border border-line p-3">
      <p className="mb-2 text-[13px] font-semibold text-ink">
        Let {ME.name.split(' ')[0]} know where things stand
      </p>
      <div className="space-y-2" role="radiogroup" data-tour={selected ? undefined : 'referrer-options'}>
        {options.map((opt) => {
          const choice = referrerChoice(opt, ME.name)!
          const active = selected === opt
          return (
            <button
              key={opt}
              role="radio"
              aria-checked={active}
              onClick={() => selectOption(opt)}
              className={`flex w-full items-start gap-3 rounded-card border px-3 py-2.5 text-left transition-colors ${
                active ? 'border-positive bg-positive-tint/50' : 'border-line hover:bg-surface-hover'
              }`}
            >
              <span
                className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border-2 ${
                  active ? 'border-positive' : 'border-black/30'
                }`}
                aria-hidden
              >
                {active && <span className="h-2 w-2 rounded-full bg-positive" />}
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-ink">{choice.label}</span>
                <span className="block text-[12px] text-ink-muted">{choice.hint}</span>
              </span>
            </button>
          )
        })}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder={`Add a note for ${ME.name.split(' ')[0]} (optional)`}
        className="mt-3 w-full resize-none rounded-card border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {confirmingTerminal ? (
        <div className="animate-fade-in mt-3 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-hover px-3 py-2.5">
          <span className="text-[13px] text-ink">
            You won&apos;t be able to change this afterwards. Send it?
          </span>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmingTerminal(false)}>
              Cancel
            </Button>
            <Button onClick={post} data-tour="send-update">Send</Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex justify-end">
          <Button onClick={handlePost} disabled={!selected} data-tour={selected ? 'send-update' : undefined}>
            Send update
          </Button>
        </div>
      )}
    </div>
  )
}

// ——— The status change ———
// Timing, in one place. The hero goes first: the status you last saw holds for
// a beat so you register it, leaves, and the new one arrives. The history
// fills in after, so your eye goes hero first, then the record.
//
// The hold depends on how you got here. Opening the screen, it has to outlast
// the page fading in, or you would never read what changed. When the referrer
// has just tapped Send, a long hold would feel like the tap did nothing.
function motionTiming(live: boolean) {
  const hold = live ? 120 : 650 // how long the old status stays before it leaves
  const enter = hold + 170 // new status starts arriving as the old one clears
  return { hold, enter, entry: enter + 260, stagger: 150 }
}

function StatusHero({
  status,
  from,
  live,
  updatedAt,
}: {
  status: ReferralStatus
  from?: ReferralStatus // the status this person last saw, when it has changed
  live: boolean
  updatedAt: string
}) {
  const { hold: HOLD_MS, enter: IN_MS } = motionTiming(live)
  const changing = from !== undefined && from !== status
  // Only a referral deserves a moment. "Can't refer" gets the plain change:
  // celebrating a no would be the wrong thing to say.
  const celebrate = changing && status === 'Referred'
  const inDelay = { animationDelay: `${IN_MS}ms` }
  const afterDelay = { animationDelay: `${IN_MS + 140}ms` }

  return (
    <div className="flex items-start gap-3">
      {/* Referred wears LinkedIn's success badge: a dark check on a sage disc
          with a sage ring, as on "You're all set" and "Post successful". */}
      <span
        className={`mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full ${
          status === 'Referred'
            ? 'border-[3px] border-success-ring bg-success-disc text-success-ink' // a border, not a ring: the pulse animates box-shadow
            : 'bg-black/[0.05] text-ink-muted'
        } ${celebrate ? 'animate-ring-once' : ''}`}
        style={celebrate ? { animationDelay: `${IN_MS + 520}ms` } : undefined}
      >
        {changing && (
          <span
            className="animate-icon-out [grid-area:1/1]"
            style={{ animationDelay: `${HOLD_MS}ms` }}
            aria-hidden
          >
            <StatusIcon status={from} size={22} />
          </span>
        )}
        <span
          className={`[grid-area:1/1] ${changing && !celebrate ? 'animate-icon-in' : ''} ${
            celebrate ? 'draw-tick' : ''
          }`}
          style={
            celebrate
              ? ({ '--draw-delay': `${IN_MS}ms` } as CSSProperties)
              : changing
                ? inDelay
                : undefined
          }
        >
          {status === 'Referred' ? <Check size={22} strokeWidth={2.6} /> : <StatusIcon status={status} size={22} />}
        </span>
      </span>

      <div className="min-w-0 flex-1">
        {/* Both labels share one grid cell, so the swap never shifts the layout */}
        <p className="grid text-[22px] font-semibold leading-tight text-ink">
          {changing && (
            <span
              className="animate-status-out [grid-area:1/1]"
              style={{ animationDelay: `${HOLD_MS}ms` }}
              aria-hidden
            >
              {statusLabel(from)}
            </span>
          )}
          <span
            className={`[grid-area:1/1] ${changing ? 'animate-status-in' : ''}`}
            style={changing ? inDelay : undefined}
          >
            {statusLabel(status)}
          </span>
        </p>
        <div
          className={changing ? 'animate-fade-in' : ''}
          style={changing ? afterDelay : undefined}
        >
          <p className="mt-0.5 text-[12px] text-ink-faint">Updated {formatTimestamp(updatedAt)}</p>
          <div className="mt-3">
            <StatusExplainer status={status} />
          </div>
        </div>
      </div>
    </div>
  )
}
