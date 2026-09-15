import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase, Check, Paperclip } from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  allowedTransitions,
  deriveCurrentStatus,
  historyFor,
  isTerminal,
} from '../stateMachine'
import { RECIPIENT } from '../sampleData'
import type { ReferralStatus } from '../types'
import { StatusExplainer } from '../components/StatusExplainer'
import { Button } from '../components/Button'
import { StatusIcon } from '../statusMeta'
import { displayActor, formatDate, formatTimestamp } from '../format'

export function StatusPage() {
  const { id } = useParams<{ id: string }>()
  const { role, referralRequests, statusUpdates, markRequestsSeen } = useApp()
  const navigate = useNavigate()

  // Brief, auto-dismissing acknowledgment after a status change (FIX 2 —
  // visibility of system status). Lifted here so it survives the action's own
  // state change (Withdraw unmounts the requester action once terminal).
  const [ack, setAck] = useState<string | null>(null)
  const ackTimer = useRef<number | null>(null)
  const showAck = useCallback((message: string) => {
    setAck(message)
    if (ackTimer.current) window.clearTimeout(ackTimer.current)
    ackTimer.current = window.setTimeout(() => setAck(null), 2500)
  }, [])
  useEffect(
    () => () => {
      if (ackTimer.current) window.clearTimeout(ackTimer.current)
    },
    [],
  )

  const request = referralRequests.find((r) => r.id === id)

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
  const history = historyFor(request, statusUpdates)

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-4">
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
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
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-11 w-11 shrink-0 place-items-center rounded-full bg-black/[0.05] text-ink-muted">
              <StatusIcon status={status} size={22} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[22px] font-semibold leading-tight text-ink">
                {status}
              </p>
              <p className="mt-0.5 text-[12px] text-ink-faint">
                Updated {formatTimestamp(history.at(-1)?.changedAt ?? request.createdAt)}
              </p>
              <div className="mt-3">
                <StatusExplainer status={status} />
              </div>
            </div>
          </div>

          {/* Role-specific actions */}
          {role === 'requester' ? (
            <RequesterActions
              requestId={request.id}
              status={status}
              onDone={showAck}
            />
          ) : (
            <ReferrerActions
              requestId={request.id}
              status={status}
              onDone={showAck}
            />
          )}

          {ack && (
            <div
              role="status"
              aria-live="polite"
              className="animate-fade-in mt-3 inline-flex items-center gap-1.5 rounded-full bg-black/[0.04] px-3 py-1.5 text-[13px] text-ink-muted"
            >
              <Check size={14} className="text-ink-muted" />
              {ack}
            </div>
          )}
        </div>

        {/* Full history */}
        <div className="px-4 py-4">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink-faint">
            History
          </p>
          <ol className="space-y-1">
            {[...history].reverse().map((su, idx) => {
              const latest = idx === 0
              const isLast = idx === history.length - 1
              return (
                <li key={su.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span
                      className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                        latest
                          ? 'bg-accent/10 text-accent'
                          : 'bg-black/[0.05] text-ink-muted'
                      }`}
                    >
                      <StatusIcon status={su.newStatus} size={15} />
                    </span>
                    {!isLast && <span className="my-1 w-px flex-1 bg-line" />}
                  </div>
                  <div className="pb-4 pt-0.5">
                    <p className="text-sm font-semibold text-ink">{su.newStatus}</p>
                    <p className="text-[12px] text-ink-muted">
                      {displayActor(su.changedBy)} · {formatTimestamp(su.changedAt)}
                    </p>
                    {su.note && (
                      <p className="mt-1.5 rounded-card border border-line bg-surface-hover px-2.5 py-1.5 text-[13px] text-ink">
                        “{su.note}”
                      </p>
                    )}
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
  onDone: (message: string) => void
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
            Withdraw this referral request?
          </span>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                postStatusUpdate(requestId, 'Withdrawn', members.me.name)
                onDone('Request withdrawn')
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
}: {
  requestId: string
  status: ReferralStatus
  onDone: (message: string) => void
}) {
  const { postStatusUpdate } = useApp()
  const options = allowedTransitions(status)
  const [selected, setSelected] = useState<ReferralStatus | ''>('')
  const [note, setNote] = useState('')
  // FIX 1: terminal statuses (Referred / Unable to Refer) are irreversible, so
  // they get an inline confirm before posting — matching Withdraw / Send.
  const [confirmingTerminal, setConfirmingTerminal] = useState(false)

  // Empty transition array → no status-change action renders at all (PRD §3).
  if (options.length === 0) {
    return (
      <div className="mt-4 rounded-card border border-line bg-surface-hover px-3 py-2.5">
        <p className="text-[13px] text-ink-muted">
          This request has reached a state with no further transitions in this
          prototype.
        </p>
      </div>
    )
  }

  const post = () => {
    if (!selected) return
    postStatusUpdate(requestId, selected, RECIPIENT.name, note)
    onDone('Status updated')
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
      <p className="mb-2 text-[13px] font-semibold text-ink">Update status</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => selectOption(opt)}
            aria-pressed={selected === opt}
            className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors ${
              selected === opt
                ? 'border-accent bg-accent/5 text-accent'
                : 'border-line text-ink hover:bg-surface-hover'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        rows={2}
        placeholder="Add a note (optional)…"
        className="mt-3 w-full resize-none rounded-card border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
      />

      {confirmingTerminal ? (
        <div className="animate-fade-in mt-3 flex flex-wrap items-center gap-3 rounded-card border border-line bg-surface-hover px-3 py-2.5">
          <span className="text-[13px] text-ink">
            This status can&apos;t be changed once posted. Post {selected}?
          </span>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={() => setConfirmingTerminal(false)}>
              Cancel
            </Button>
            <Button onClick={post}>Confirm</Button>
          </div>
        </div>
      ) : (
        <div className="mt-2 flex justify-end">
          <Button onClick={handlePost} disabled={!selected}>
            Post update
          </Button>
        </div>
      )}
    </div>
  )
}
