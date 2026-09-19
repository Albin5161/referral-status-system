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
  DEFAULT_RESUME,
  JOB,
  RECIPIENT,
  defaultReferralMessage,
  jobById,
  memberById,
} from '../sampleData'
import { Avatar } from '../components/Avatar'
import { Button } from '../components/Button'
import { save } from '../storage'

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
  const [message, setMessage] = useState(defaultReferralMessage(activeJob, recipient.name))
  const [jobAttached, setJobAttached] = useState(lean) // job known from context in lean mode
  const [resumeAttached, setResumeAttached] = useState(false) // required resume (mock)
  const [resumeError, setResumeError] = useState(false)
  const first = recipient.name.split(' ')[0]
  const [step, setStep] = useState<Step>('compose')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [simulateFailure, setSimulateFailure] = useState(false)

  const backTo = lean ? '/jobs' : `/messaging?c=${recipient.id}`

  const switchType = (next: MessageType) => {
    setType(next)
    setValidationError(null)
    if (next === 'referral' && !message.trim()) setMessage(defaultReferralMessage(activeJob, recipient.name))
  }

  // Step 1 → proceed. Referral requests must have a job attached (PRD §5.4).
  const handleContinue = () => {
    if (!lean && type === 'message') {
      if (!message.trim()) return
      sendMessage(recipient.id, message)
      navigate(`/messaging?c=${recipient.id}`)
      return
    }
    const missingJob = !jobAttached
    if (missingJob) setValidationError('Add the job you’re applying for, so ' + first + ' knows which role it is.')
    setResumeError(!resumeAttached)
    if (missingJob || !resumeAttached) return
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
          resumeName: DEFAULT_RESUME,
        },
        { simulateFailure },
      )
      // Test insight: which entry point this tester chose (sent with their feedback).
      save('tour:entryPoint', lean ? 'Job Tracker' : 'Messaging')
      navigate(`/messaging?c=${recipient.id}`) // card shows at Pending in that thread
    } catch {
      setStep('error')
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl md:px-4 md:py-4">
      <div className="overflow-hidden border-y border-line bg-surface md:rounded-card md:border md:shadow-card">
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
              ? 'Ready to send?'
              : step === 'creating'
                ? 'Sending your request…'
                : step === 'error'
                  ? 'That didn’t go through'
                  : lean
                    ? `Ask ${first} for a referral`
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
                    hint="Ask for a referral you can follow"
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
              <p className="mb-1.5 text-[13px] font-medium text-ink-muted">Your message</p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full resize-none rounded-card border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent"
                placeholder="Write your message…"
              />
            </div>

            {/* Full mode: job attachment (PRD §5.4/§5.5). Not shown in lean mode. */}
            {!lean && type === 'referral' && (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-ink-muted">
                  Job you’re applying for
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
                    data-tour="attach-job"
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
                  <p className="mt-2 text-[13px] font-medium text-danger">
                    {validationError}
                  </p>
                )}
              </div>
            )}

            {/* Optional resume attachment (mock — no real upload) */}
            {(lean || type === 'referral') && (
              <div>
                <p className="mb-1.5 text-[13px] font-medium text-ink-muted">
                  Your resume
                </p>
                <p className="-mt-1 mb-2 text-[12px] text-ink-muted">
                  Required. It helps {first} vouch for you with confidence.
                </p>
                {resumeAttached ? (
                  <div className="flex items-center gap-3 rounded-card border border-line bg-surface-hover px-3 py-2.5">
                    <span className="grid h-9 w-9 place-items-center rounded bg-accent/10 text-accent">
                      <FileText size={18} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink">
                        {DEFAULT_RESUME}
                      </p>
                      <p className="truncate text-[13px] text-ink-muted">PDF</p>
                    </div>
                    <button
                      onClick={() => setResumeAttached(false)}
                      aria-label="Remove resume"
                      className="rounded-full p-1 text-ink-faint hover:bg-black/5 hover:text-ink"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <button
                    data-tour="attach-resume"
                    onClick={() => {
                      setResumeAttached(true)
                      setResumeError(false)
                    }}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium text-ink hover:bg-surface-hover ${
                      resumeError ? 'border-danger' : 'border-line'
                    }`}
                  >
                    <Paperclip size={16} />
                    Attach resume
                  </button>
                )}
                {resumeError && (
                  <p className="mt-2 text-[13px] font-medium text-danger">
                    Please attach your resume before sending.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-1">
              <Button
                data-tour="review-request"
                onClick={handleContinue}
                disabled={!lean && type === 'message' && !message.trim()}
              >
                {lean || type === 'referral' ? 'Review request' : 'Send'}
              </Button>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-4 p-4">
            <p className="text-[13px] text-ink-muted">
              Take a quick look. Once it’s sent, {first} will see your request, and you’ll
              be able to follow its status without having to chase.
            </p>
            <dl className="divide-y divide-line rounded-card border border-line">
              <Row label="To" value={recipient.name} />
              <Row
                label="Role"
                value={`${activeJob.title} · ${activeJob.company}`}
              />
              <Row label="Resume" value={DEFAULT_RESUME} />
            </dl>
            <div className="rounded-card border border-line bg-surface-hover px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Your message
              </p>
              <p className="mt-1 whitespace-pre-line text-sm text-ink">{message}</p>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={() => setStep('compose')}>
                Edit
              </Button>
              <Button data-tour="send-request" onClick={handleConfirm}>
                Send request
              </Button>
            </div>
          </div>
        )}

        {step === 'creating' && (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <Loader2 size={28} className="animate-spin text-accent" />
            <p className="text-sm text-ink-muted">Sending your request to {first}…</p>
          </div>
        )}

        {step === 'error' && (
          <div className="space-y-4 p-4">
            <p className="text-sm font-medium text-ink">
              We couldn&apos;t send your request just now. Nothing is lost: your message is
              saved below, so you can try again.
            </p>
            <div className="rounded-card border border-line bg-surface-hover px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-ink-faint">
                Your message
              </p>
              <p className="mt-1 text-sm text-ink">{message}</p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setStep('compose')}>
                Edit message
              </Button>
              <Button
                onClick={() => {
                  setSimulateFailure(false)
                  handleConfirm()
                }}
              >
                Try again
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
