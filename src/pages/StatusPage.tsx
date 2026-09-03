import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Briefcase } from 'lucide-react'
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
  const { role, referralRequests, statusUpdates } = useApp()
  const navigate = useNavigate()

  const request = referralRequests.find((r) => r.id === id)

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
            <RequesterActions requestId={request.id} status={status} />
          ) : (
            <ReferrerActions requestId={request.id} status={status} />
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
}: {
  requestId: string
  status: ReferralStatus
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
              onClick={() =>
                postStatusUpdate(requestId, 'Withdrawn', members.me.name)
              }
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
}: {
  requestId: string
  status: ReferralStatus
}) {
  const { postStatusUpdate } = useApp()
  const options = allowedTransitions(status)
  const [selected, setSelected] = useState<ReferralStatus | ''>('')
  const [note, setNote] = useState('')

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

  const submit = () => {
    if (!selected) return
    postStatusUpdate(requestId, selected, RECIPIENT.name, note)
    setSelected('')
    setNote('')
  }

  return (
    <div className="mt-4 rounded-card border border-line p-3">
      <p className="mb-2 text-[13px] font-semibold text-ink">Update status</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => setSelected(opt)}
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

      <div className="mt-2 flex justify-end">
        <Button onClick={submit} disabled={!selected}>
          Post update
        </Button>
      </div>
    </div>
  )
}
