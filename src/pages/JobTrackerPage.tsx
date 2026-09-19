import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Briefcase, UserPlus, X } from 'lucide-react'
import { JOBS, memberById } from '../sampleData'
import type { LinkedInMember, TrackedJob } from '../types'
import { Avatar } from '../components/Avatar'

// Job Tracker — Entry Point 2 (PRD §4b). Each row shows the connections the
// requester has at that company and an "Ask for referral" affordance. Choosing a
// connection deep-links into the lean composer, which rejoins the same Confirm →
// creation flow as Entry Point 1.
export function JobTrackerPage() {
  const [pickerJob, setPickerJob] = useState<TrackedJob | null>(null)

  return (
    <div className="animate-fade-in mx-auto max-w-3xl md:px-4 md:py-6">
      <div className="overflow-hidden border-y border-line bg-surface md:rounded-card md:border md:shadow-card">
        <div className="border-b border-line px-4 py-3">
          <h1 className="text-[16px] font-semibold text-ink">Job Tracker</h1>
          <p className="text-[13px] text-ink-muted">
            Jobs you’re tracking. Ask a connection at the company for a referral.
          </p>
        </div>

        <ul className="divide-y divide-line">
          {JOBS.map((job) => (
            <JobRow key={job.id} job={job} onAsk={() => setPickerJob(job)} />
          ))}
        </ul>
      </div>

      {pickerJob && (
        <ConnectionPicker job={pickerJob} onClose={() => setPickerJob(null)} />
      )}
    </div>
  )
}

function JobRow({ job, onAsk }: { job: TrackedJob; onAsk: () => void }) {
  const connections = job.connectionIds
    .map((id) => memberById(id))
    .filter((m): m is LinkedInMember => Boolean(m))
  const hasConnections = connections.length > 0

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-surface-hover">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded bg-black/[0.04] text-ink-muted">
        <Briefcase size={20} />
      </span>

      {/* Phones: text takes the full row and the action wraps underneath it */}
      <div className="min-w-0 flex-1 basis-[calc(100%-56px)] sm:basis-auto">
        <p className="truncate text-[15px] font-semibold text-ink">{job.title}</p>
        <p className="truncate text-[13px] text-ink-muted">
          {job.company} · {job.trackStatus}
        </p>

        {/* Connection avatars for this company (real LinkedIn shows these) */}
        {hasConnections && (
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex -space-x-2">
              {connections.slice(0, 3).map((c) => (
                <span key={c.id} className="ring-2 ring-surface rounded-full">
                  <Avatar name={c.name} size={22} />
                </span>
              ))}
            </div>
            <span className="text-[12px] text-ink-faint">
              {connections.length === 1
                ? `${connections[0].name} · ${connections[0].degree}`
                : `${connections.length} connections`}
            </span>
          </div>
        )}
      </div>

      {/* Ask for referral — muted with a stated reason when zero connections (§4b.3) */}
      {hasConnections ? (
        <button
          onClick={onAsk}
          className="ml-14 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent sm:ml-0 px-3.5 py-1.5 text-[13px] font-semibold text-accent transition-colors hover:bg-accent/5"
        >
          <UserPlus size={15} />
          Ask for referral
        </button>
      ) : (
        <span
          className="ml-14 inline-flex shrink-0 cursor-not-allowed items-center sm:ml-0 rounded-full border border-line px-3.5 py-1.5 text-[12px] font-medium text-ink-faint"
          title={`No connections at ${job.company} yet.`}
        >
          No connections at {job.company} yet.
        </span>
      )}
    </li>
  )
}

function ConnectionPicker({
  job,
  onClose,
}: {
  job: TrackedJob
  onClose: () => void
}) {
  const navigate = useNavigate()
  const connections = job.connectionIds
    .map((id) => memberById(id))
    .filter((m): m is LinkedInMember => Boolean(m))

  const choose = (memberId: string) => {
    onClose()
    navigate(`/compose?to=${memberId}&job=${job.id}`)
  }

  return (
    <div
      className="animate-fade-in fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="animate-pop-in w-full max-w-sm overflow-hidden rounded-card bg-surface shadow-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ink">Ask for a referral</p>
            <p className="truncate text-[12px] text-ink-muted">
              {job.title} · {job.company}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="ml-auto rounded-full p-1 text-ink-muted hover:bg-black/5 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        <p className="px-4 pt-3 text-[12px] font-medium text-ink-muted">
          Choose a connection at {job.company}
        </p>
        <ul className="p-2">
          {connections.map((c) => (
            <li key={c.id}>
              <button
                onClick={() => choose(c.id)}
                className="flex w-full items-center gap-3 rounded-card px-2 py-2 text-left hover:bg-surface-hover"
              >
                <Avatar name={c.name} size={40} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {c.name}
                  </p>
                  <p className="truncate text-[12px] text-ink-muted">
                    {c.headline} · {c.degree}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
