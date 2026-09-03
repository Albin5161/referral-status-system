import { useNavigate, useSearchParams } from 'react-router-dom'
import { PenSquare, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CONNECTIONS, ME, RECIPIENT } from '../sampleData'
import { deriveCurrentStatus } from '../stateMachine'
import { Avatar } from '../components/Avatar'
import { ThreadView } from '../components/ThreadView'
import { formatTimestamp } from '../format'

// Messaging inbox — LinkedIn-style two-pane layout. The conversation list is the
// requester's connections; selecting one opens that 1:1 thread. The ?c= param
// selects the active conversation so other flows (Job Tracker → Refer) can deep
// link straight to the right thread.
export function MessagingPage() {
  const { role, threadMessages, referralRequests, statusUpdates } = useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const rows = CONNECTIONS.map((c) => {
    const msgs = threadMessages.filter((m) => m.peerId === c.id)
    const reqs = referralRequests.filter((r) => r.recipientId === c.id)
    const lastMsg = msgs.at(-1)
    const lastReq = reqs.at(-1)
    const lastAt = Math.max(
      lastMsg ? new Date(lastMsg.sentAt).getTime() : 0,
      lastReq ? new Date(lastReq.createdAt).getTime() : 0,
    )
    let preview = 'Start the conversation'
    if (lastMsg && (!lastReq || new Date(lastMsg.sentAt) >= new Date(lastReq.createdAt))) {
      preview = `${lastMsg.senderId === ME.id ? 'You: ' : ''}${lastMsg.body}`
    } else if (lastReq) {
      preview = `Referral Request · ${deriveCurrentStatus(lastReq, statusUpdates)}`
    }
    return { member: c, preview, lastAt }
  }).sort((a, b) => b.lastAt - a.lastAt)

  const selected = params.get('c') ?? RECIPIENT.id
  const select = (id: string) => setParams({ c: id }, { replace: true })

  return (
    <div className="animate-fade-in mx-auto max-w-6xl px-4 py-6">
      <div className="grid h-[calc(100vh-140px)] min-h-[520px] grid-cols-1 overflow-hidden rounded-card border border-line bg-surface shadow-card md:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        {/* Conversation list */}
        <div className="flex min-h-0 flex-col border-r border-line">
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            <h1 className="text-[16px] font-semibold text-ink">Messaging</h1>
            <div className="relative ml-auto hidden items-center sm:flex">
              <Search size={14} className="pointer-events-none absolute left-2 text-ink-muted" />
              <input
                placeholder="Search messages"
                className="w-40 rounded bg-[#edf3f8] py-1.5 pl-7 pr-2 text-[13px] outline-none placeholder:text-ink-muted"
              />
            </div>
            {role === 'requester' && (
              <button
                onClick={() => navigate('/jobs')}
                aria-label="New referral from Job Tracker"
                title="Ask for a referral from your Job Tracker"
                className="rounded-full p-1.5 text-ink-muted hover:bg-black/5 hover:text-ink"
              >
                <PenSquare size={18} />
              </button>
            )}
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {rows.map(({ member, preview, lastAt }) => (
              <ConvoRow
                key={member.id}
                name={member.name}
                preview={preview}
                when={lastAt ? formatTimestamp(new Date(lastAt).toISOString()) : ''}
                active={selected === member.id}
                onClick={() => select(member.id)}
              />
            ))}
          </ul>
        </div>

        {/* Right pane — the selected conversation */}
        <div className="min-h-0">
          <ThreadView peerId={selected} />
        </div>
      </div>
    </div>
  )
}

function ConvoRow({
  name,
  preview,
  when,
  active,
  onClick,
}: {
  name: string
  preview: string
  when: string
  active: boolean
  onClick: () => void
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-start gap-3 border-b border-line border-l-2 px-3 py-3 text-left transition-colors ${
          active
            ? 'border-l-accent bg-[#eef3f8]'
            : 'border-l-transparent hover:bg-surface-hover'
        }`}
      >
        <Avatar name={name} size={48} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold text-ink">{name}</span>
            <span className="shrink-0 text-[11px] text-ink-faint">{when}</span>
          </div>
          <p className="truncate text-[13px] text-ink-muted">{preview}</p>
        </div>
      </button>
    </li>
  )
}
