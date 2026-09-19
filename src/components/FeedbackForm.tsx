import { useEffect, useRef, useState } from 'react'
import { CircleCheck, X } from 'lucide-react'
import { useTour } from '../context/TourContext'
import { Button } from './Button'

const RATINGS = [
  { value: 1, label: 'Very poor' },
  { value: 2, label: 'Poor' },
  { value: 3, label: 'Okay' },
  { value: 4, label: 'Good' },
  { value: 5, label: 'Excellent' },
]

// End-of-test survey. Opens by itself once the tester reaches the final status,
// and from the guide bar or footer at any time.
export function FeedbackForm() {
  const { feedbackOpen, closeFeedback, submitFeedback, restartTest } = useTour()
  const [rating, setRating] = useState<number | null>(null)
  const [useful, setUseful] = useState<'yes' | 'no' | null>(null)
  const [usefulWhy, setUsefulWhy] = useState('')
  const [improve, setImprove] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)
  const [sent, setSent] = useState(false)
  const firstRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!feedbackOpen) return
    setSent(false)
    setError(false)
    firstRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeFeedback()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [feedbackOpen, closeFeedback])

  if (!feedbackOpen) return null

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating == null || useful == null || sending) return
    setSending(true)
    setError(false)
    try {
      await submitFeedback({ rating, useful, usefulWhy, improve })
      setSent(true)
      setRating(null)
      setUseful(null)
      setUsefulWhy('')
      setImprove('')
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center md:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
        className="animate-slide-up max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl bg-surface md:max-w-[460px] md:rounded-card md:shadow-pop"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <h2 id="feedback-title" className="text-[16px] font-semibold text-ink">
            {sent ? 'Feedback sent' : 'How did it go?'}
          </h2>
          <button
            onClick={closeFeedback}
            aria-label="Close"
            className="rounded-full p-1.5 text-ink-muted hover:bg-black/5 hover:text-ink"
          >
            <X size={20} />
          </button>
        </div>

        {sent ? (
          <div className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-6 text-center">
            <CircleCheck size={40} className="mx-auto text-ink-muted" aria-hidden />
            <p className="mt-3 text-[18px] font-semibold text-ink">Thanks, that really helps</p>
            <p className="mt-1 text-[14px] text-ink-muted">
              Your answers go straight to the designer working on this concept.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="secondary" onClick={restartTest}>
                Try it again from the start
              </Button>
              <Button onClick={closeFeedback}>Done</Button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} className="px-5 pb-[max(20px,env(safe-area-inset-bottom))] pt-4">
            <fieldset>
              <legend className="text-[15px] font-semibold text-ink">
                How was your experience with Referral Status?
              </legend>
              <div className="mt-3 grid grid-cols-5 gap-1.5" role="radiogroup">
                {RATINGS.map((r, n) => {
                  const active = rating === r.value
                  return (
                    <button
                      key={r.value}
                      ref={n === 0 ? firstRef : undefined}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      aria-label={`${r.value}, ${r.label}`}
                      onClick={() => setRating(r.value)}
                      className={`flex h-12 items-center justify-center rounded-card border text-[16px] font-semibold transition-colors ${
                        active
                          ? 'border-accent bg-accent text-white'
                          : 'border-black/20 text-ink hover:border-ink hover:bg-surface-hover'
                      }`}
                    >
                      {r.value}
                    </button>
                  )
                })}
              </div>
              <div className="mt-1.5 flex justify-between text-[12px] text-ink-muted">
                <span>Very poor</span>
                <span>Excellent</span>
              </div>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-[15px] font-semibold text-ink">
                Would you find this feature useful?
              </legend>
              <div className="mt-2 grid grid-cols-2 gap-2" role="radiogroup">
                {(['yes', 'no'] as const).map((v) => {
                  const active = useful === v
                  return (
                    <button
                      key={v}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setUseful(v)}
                      className={`h-11 rounded-card border text-[15px] font-semibold transition-colors ${
                        active
                          ? 'border-accent bg-accent text-white'
                          : 'border-black/20 text-ink hover:border-ink hover:bg-surface-hover'
                      }`}
                    >
                      {v === 'yes' ? 'Yes' : 'No'}
                    </button>
                  )
                })}
              </div>
              {useful && (
                <label className="animate-fade-in mt-3 block">
                  <span className="text-[14px] font-medium text-ink">
                    {useful === 'yes' ? 'What makes it useful to you?' : 'Why not?'}
                  </span>
                  <textarea
                    value={usefulWhy}
                    onChange={(e) => setUsefulWhy(e.target.value)}
                    rows={3}
                    placeholder={
                      useful === 'yes'
                        ? 'e.g. I’d stop worrying whether my message was seen…'
                        : 'e.g. I’d rather just message them directly…'
                    }
                    className="mt-1.5 w-full resize-none rounded-card border border-black/30 px-3 py-2 text-[15px] text-ink outline-none placeholder:text-ink-muted focus:border-accent"
                  />
                </label>
              )}
            </fieldset>

            <label className="mt-5 block">
              <span className="text-[15px] font-semibold text-ink">What could be made better?</span>
              <span className="mt-0.5 block text-[13px] text-ink-muted">
                Anything confusing, missing or surprising along the way.
              </span>
              <textarea
                value={improve}
                onChange={(e) => setImprove(e.target.value)}
                rows={4}
                placeholder="e.g. I wasn’t sure what “No reply yet” meant…"
                className="mt-2 w-full resize-none rounded-card border border-black/30 px-3 py-2 text-[15px] text-ink outline-none placeholder:text-ink-muted focus:border-accent"
              />
            </label>

            {error && (
              <p role="alert" className="mt-2 text-[13px] text-danger">
                Couldn’t send your feedback. Check your connection and try again.
              </p>
            )}

            <div className="mt-4 flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={closeFeedback}>
                Not now
              </Button>
              <Button type="submit" disabled={rating == null || useful == null || sending} className="px-5">
                {sending ? 'Sending…' : 'Send feedback'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
