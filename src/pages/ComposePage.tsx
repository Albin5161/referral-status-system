import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  Briefcase,
  Check,
  FileText,
  Loader2,
  MessageSquare,
  Paperclip,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import {
  JOB,
  RECIPIENT,
  defaultReferralMessage,
  jobById,
  memberById,
} from '../sampleData'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'

type MessageType = 'message' | 'referral'
type Step = 'compose' | 'review' | 'creating' | 'error'

export function ComposePage() {
  const { createReferralRequest, sendMessage } = useApp()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  // Entry Point 2 preset (PRD §4b): /compose?to=<memberId>&job=<jobId>. When both
  // are present we render the LEAN composer — recipient + job already known, so the
  // message-type toggle and job-attachment steps are skipped. It still rejoins the
  // exact same Confirm → createReferralRequest path as Entry Point 1.
  const presetMember = memberById(params.get('to') ?? '')
  const presetJob = jobById(params.get('job') ?? '')
  const lean = Boolean(presetMember && presetJob)

  const recipient = presetMember ?? RECIPIENT
  const activeJob = presetJob ?? JOB

  const [type, setType] = useState<MessageType>('referral')
  const [message, setMessage] = useState(defaultReferralMessage(activeJob))
  const [jobAttached, setJobAttached] = useState(lean) // job known from context in lean mode
  const [step, setStep] = useState<Step>('compose')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [simulateFailure, setSimulateFailure] = useState(false)

  const backTo = lean ? '/jobs' : `/messaging?c=${recipient.id}`

  const switchType = (next: MessageType) => {
    setType(next)
    setValidationError(null)
    if (next === 'referral' && !message.trim()) setMessage(defaultReferralMessage(activeJob))
  }

  // Step 1 → proceed. Referral requests must have a job attached (PRD §5.4).
  const handleContinue = () => {
    if (!lean && type === 'message') {
      if (!message.trim()) return
      sendMessage(recipient.id, message)
      navigate(`/messaging?c=${recipient.id}`)
      return
    }
    if (!jobAttached) {
      setValidationError('Select a job posting to send a Referral Request.')
      return
    }
    setValidationError(null)
    setStep('review') // genuine confirmation step guarding a one-way door (PRD §5.6)
  }

  // Step 3 → pessimistic creation (PRD §5.7). Same creation logic for both entry
  // points — only the recipient/job are pre-populated in lean mode.
  const handleConfirm = async () => {
    setStep('creating')
    try {
      await createReferralRequest(
        {
          recipientId: recipient.id,
          jobPostingId: activeJob.id,
          jobTitleSnapshot: activeJob.title,
          companySnapshot: activeJob.company,
          initialMessage: message.trim(),
        },
        { simulateFailure },
      )
      navigate(`/messaging?c=${recipient.id}`) // card shows at Pending in that thread
    } catch {
      setStep('error')
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-4">
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <button
            onClick={() =>
              step === 'compose' ? navigate(backTo) : setStep('compose')
            }
            aria-label="Back"
            className="rounded-full p-1 text-ink-muted hover:bg-black/5 hover:text-ink"
          >
            <ArrowLeft size={18} />
          </button>
          <h1 className="text-[15px] font-semibold text-ink">
            {step === 'review'
              ? 'Review your Referral Request'
              : step === 'creating'
                ? 'Creating Referral Request…'
                : step === 'error'
                  ? 'Something went wrong'
                  : lean
                    ? 'Ask for referral'
                    : 'New message'}
          </h1>
        </div>

        {/* Recipient (always visible) */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="text-[13px] text-ink-muted">To</span>
          <Avatar name={recipient.name} size={32} />
          <span className="text-sm font-medium text-ink">{recipient.name}</span>
          <span className="text-[13px] text-ink-faint">
            {recipient.headline ?? recipient.degree ?? ''}
          </span>
        </div>

        {step === 'compose' && (
          <div className="space-y-4 p-4">
            {/* Full mode: explicit message-type choice (PRD §5.3). Skipped in lean mode. */}
            {!lean && (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-ink-muted">
                  Message type
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <TypeCard
                    active={type === 'message'}
                    onClick={() => switchType('message')}
                    icon={<MessageSquare size={16} />}
                    label="Message"
                    hint="A plain message"
                  />
                  <TypeCard
                    active={type === 'referral'}
                    onClick={() => switchType('referral')}
                    icon={<FileText size={16} />}
                    label="Referral Request"
                    hint="Ask for a referral"
                  />
                </div>
              </div>
            )}

            {/* Lean mode: the job is fixed context from the Job Tracker row. */}
            {lean && (
              <div className="flex items-center gap-3 rounded-card border border-line bg-surface-hover px-3 py-2.5">
                <span className="grid h-9 w-9 place-items-center rounded bg-accent/10 text-accent">
                  <Briefcase size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {activeJob.title}
                  </p>
                  <p className="truncate text-[13px] text-ink-muted">
                    {activeJob.company}
                  </p>
                </div>
              </div>
            )}

            {/* Message body */}
            <div>
              <p className="mb-1.5 text-[13px] font-medium text-ink-muted">Message</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-card border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Write your message…"
              />
            </div>

            {/* Full mode: job attachment (PRD §5.4/§5.5). Not shown in lean mode. */}
            {!lean && type === 'referral' && (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-ink-muted">
                  Job posting
                </p>
                {jobAttached ? (
                  <div className="flex items-center gap-3 rounded-card border border-line bg-surface-hover px-3 py-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded bg-accent/10 text-accent">
                      <Briefcase size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {activeJob.title}
                      </p>
                      <p className="truncate text-[13px] text-ink-muted">
                        {activeJob.company}
                      </p>
                    </div>
                    <button
                      onClick={() => setJobAttached(false)}
                      aria-label="Remove job posting"
                      className="rounded-full p-1 text-ink-faint hover:bg-black/5 hover:text-ink"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setJobAttached(true)
                      setValidationError(null)
                    }}
                    className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface-hover"
                  >
                    <Paperclip size={16} />
                    Attach job posting
                  </button>
                )}
                {validationError && (
                  <p className="mt-2 text-[13px] font-medium text-red-600">
                    {validationError}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                onClick={handleContinue}
                disabled={!lean && type === 'message' && !message.trim()}
              >
                {lean || type === 'referral' ? 'Continue' : 'Send'}
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 p-4">
            <p className="text-[13px] text-ink-muted">
              Please confirm the details below. A Referral Request will be created.
            </p>
            <dl className="divide-y divide-line rounded-card border border-line">
              <Row label="Recipient" value={recipient.name} />
              <Row
                label="Job posting"
                value={`${activeJob.title} · ${activeJob.company}`}
              />
              <Row label="Message type" value="Referral Request" />
            </dl>
            <div className="rounded-card border border-line bg-surface-hover px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Message
              </p>
              <p className="mt-1 text-sm text-ink">{message}</p>
            </div>

            {/* Demo-only failure toggle (PRD §6 optional failure path) */}
            <label className="flex items-center gap-2 text-[12px] text-ink-faint">
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
              />
              Simulate a creation failure (demo control)
            </label>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setStep('compose')}>
                Edit
              </Button>
              <Button onClick={handleConfirm}>Confirm &amp; create</Button>
            </div>
          </div>
        )}

        {step === 'creating' && (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Loader2 size={28} className="animate-spin text-accent" />
            <p className="text-sm text-ink-muted">Creating Referral Request…</p>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4 p-4">
            <p className="text-sm font-medium text-red-600">
              Couldn&apos;t create your Referral Request.
            </p>
            <div className="rounded-card border border-line bg-surface-hover px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Your message (preserved)
              </p>
              <p className="mt-1 text-sm text-ink">{message}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setStep('compose')}>
                Edit Message
              </Button>
              <Button
                onClick={() => {
                  setSimulateFailure(false)
                  handleConfirm()
                }}
              >
                Retry
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TypeCard({
  active,
  onClick,
  icon,
  label,
  hint,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  hint: string
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-start gap-2 rounded-card border px-3 py-2.5 text-left transition-colors ${
        active ? 'border-accent bg-accent/5' : 'border-line hover:bg-surface-hover'
      }`}
    >
      <span className={`mt-0.5 ${active ? 'text-accent' : 'text-ink-muted'}`}>
        {icon}
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
          {label}
          {active && <Check size={14} className="text-accent" />}
        </span>
        <span className="block text-[12px] text-ink-muted">{hint}</span>
      </span>
    </button>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <dt className="text-[13px] text-ink-muted">{label}</dt>
      <dd className="text-sm font-medium text-ink">{value}</dd>
    </div>
  )
}
