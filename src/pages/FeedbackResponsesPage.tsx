import type { FeedbackEntry } from '../context/TourContext'
import { load } from '../storage'
import { Button } from '../components/Button'

const REMOTE = Boolean(import.meta.env.VITE_FEEDBACK_ENDPOINT)

// Facilitator view at /feedback. Lists responses saved in THIS browser, which
// covers in-person sessions run on your own laptop or phone. Remote testers'
// answers only reach you through VITE_FEEDBACK_ENDPOINT (e.g. Formspree).
export function FeedbackResponsesPage() {
  const entries = load<FeedbackEntry[]>('tour:feedback', []).slice().reverse()
  const avg = entries.length
    ? (entries.reduce((s, e) => s + e.rating, 0) / entries.length).toFixed(1)
    : '–'
  const usefulYes = entries.filter((e) => e.useful === 'yes').length

  const downloadCsv = () => {
    const cols: (keyof FeedbackEntry)[] = [
      'submittedAt',
      'rating',
      'useful',
      'usefulWhy',
      'improve',
      'entryPoint',
      'completedJourney',
      'viewport',
    ]
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = [cols.join(','), ...entries.map((e) => cols.map((c) => esc(e[c])).join(','))].join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'referral-status-feedback.csv'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-6">
      <h1 className="text-[20px] font-semibold text-ink">Feedback responses</h1>
      <p className="mt-1 text-[13px] text-ink-muted">
        Saved in this browser only.{' '}
        {REMOTE
          ? 'Everyone’s responses, from any device, are also in your Formspree inbox.'
          : 'To collect responses from other people’s devices, set VITE_FEEDBACK_ENDPOINT.'}
      </p>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Responses" value={String(entries.length)} />
        <Stat label="Avg. rating" value={avg} />
        <Stat label="Find it useful" value={entries.length ? `${usefulYes}/${entries.length}` : '–'} />
      </div>

      {entries.length > 0 && (
        <div className="mt-4 flex justify-end">
          <Button variant="secondary" onClick={downloadCsv}>
            Download CSV
          </Button>
        </div>
      )}

      <ul className="mt-3 space-y-2">
        {entries.length === 0 && (
          <li className="rounded-card border border-line bg-surface px-4 py-8 text-center text-sm text-ink-muted">
            No responses on this device yet.
          </li>
        )}
        {entries.map((e) => (
          <li key={e.submittedAt} className="rounded-card border border-line bg-surface p-4 shadow-card">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-ink-muted">
              <span className="font-semibold text-ink">{e.rating}/5</span>
              <span>Useful: {e.useful === 'yes' ? 'Yes' : e.useful === 'no' ? 'No' : '–'}</span>
              <span>{e.completedJourney ? 'Finished the task' : 'Didn’t finish'}</span>
              {e.entryPoint && <span>via {e.entryPoint}</span>}
              <span className="ml-auto">{new Date(e.submittedAt).toLocaleString()}</span>
            </div>
            {e.usefulWhy && <Answer q={e.useful === 'no' ? 'Why not useful' : 'Why useful'} a={e.usefulWhy} />}
            {e.improve && <Answer q="Could be better" a={e.improve} />}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-line bg-surface px-3 py-2.5">
      <p className="text-[12px] text-ink-muted">{label}</p>
      <p className="text-[20px] font-semibold text-ink">{value}</p>
    </div>
  )
}

function Answer({ q, a }: { q: string; a: string }) {
  return (
    <p className="mt-2 text-[14px] text-ink">
      <span className="text-[12px] font-semibold uppercase tracking-wide text-ink-muted">{q}</span>
      <br />
      {a}
    </p>
  )
}
