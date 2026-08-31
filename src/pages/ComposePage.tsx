import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { DEFAULT_REFERRAL_MESSAGE, JOB, RECIPIENT } from '../sampleData'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'

type MessageType = 'message' | 'referral'
type Step = 'compose' | 'review' | 'creating' | 'error'

export function ComposePage() {
  const { createReferralRequest, sendMessage } = useApp()
  const navigate = useNavigate()

  const [type, setType] = useState<MessageType>('referral')
  const [message, setMessage] = useState(DEFAULT_REFERRAL_MESSAGE)
  const [jobAttached, setJobAttached] = useState(false)
  const [step, setStep] = useState<Step>('compose')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [simulateFailure, setSimulateFailure] = useState(false)

  const switchType = (next: MessageType) => {
    setType(next)
    setValidationError(null)
    // Offer the designed default message only for referral requests.
    if (next === 'referral' && !message.trim()) setMessage(DEFAULT_REFERRAL_MESSAGE)
  }

  // Step 1 → proceed. Referral requests must have a job attached (PRD §5.4).
  const handleContinue = () => {
    if (type === 'message') {
      if (!message.trim()) return
      sendMessage(message)
      navigate('/thread')
      return
    }
    if (!jobAttached) {
      setValidationError('Select a job posting to send a Referral Request.')
      return
    }
    setValidationError(null)
    setStep('review') // genuine confirmation step guarding a one-way door (PRD §5.6)
  }

  // Step 3 → pessimistic creation (PRD §5.7). Object does not exist until resolved.
  const handleConfirm = async () => {
    setStep('creating')
    try {
      await createReferralRequest(
        {
          recipientId: RECIPIENT.id,
          jobPostingId: JOB.id,
          jobTitleSnapshot: JOB.title,
          companySnapshot: JOB.company,
          initialMessage: message.trim(),
        },
        { simulateFailure },
      )
      navigate('/thread') // card shows immediately at Pending (PRD §5.8)
    } catch {
      setStep('error')
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {/* Header */}
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <button
            onClick={() =>
              step === 'compose' ? navigate('/thread') : setStep('compose')
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
                  : 'New message'}
          </h1>
        </div>

        {/* Recipient (always visible) */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <span className="text-[13px] text-ink-muted">To</span>
          <Avatar name={RECIPIENT.name} size={32} />
          <span className="text-sm font-medium text-ink">{RECIPIENT.name}</span>
          <span className="text-[13px] text-ink-faint">2nd-degree connection</span>
        </div>

        {step === 'compose' && (
          <div className="space-y-4 p-4">
            {/* Message-type choice — explicit, never auto-detected (PRD §5.3) */}
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

            {/* Job attachment — only relevant to referral requests */}
            {type === 'referral' && (
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
                        {JOB.title}
                      </p>
                      <p className="truncate text-[13px] text-ink-muted">
                        {JOB.company}
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
                disabled={type === 'message' && !message.trim()}
              >
                {type === 'referral' ? 'Continue' : 'Send'}
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
              <Row label="Recipient" value={RECIPIENT.name} />
              <Row label="Job posting" value={`${JOB.title} · ${JOB.company}`} />
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
        active
          ? 'border-accent bg-accent/5'
          : 'border-line hover:bg-surface-hover'
      }`}
    >
      <span
        className={`mt-0.5 ${active ? 'text-accent' : 'text-ink-muted'}`}
      >
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
