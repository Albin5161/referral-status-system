import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, PenSquare, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { CONNECTIONS, ME, RECIPIENT } from '../sampleData'
import { deriveCurrentStatus } from '../stateMachine'
import { statusLabel } from '../statusMeta'
import { Avatar } from '../components/Avatar'
import { ThreadView } from '../components/ThreadView'
import { formatTimestamp } from '../format'

// Messaging inbox — LinkedIn-style two-pane layout. The conversation list is the
// requester's connections; selecting one opens that 1:1 thread. The ?c= param
// selects the active conversation so other flows (Job Tracker → Refer) can deep
// link straight to the right thread.
export function MessagingPage() {
  const { role, threadMessages, referralRequests, statusUpdates, seenRequestIds, markRequestsSeen } =
    useApp()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  // Every conversation is ME ↔ a connection. The referrer is Alex, so their inbox
  // holds just the one conversation with Albin.
  const convos = role === 'referrer' ? [RECIPIENT] : CONNECTIONS
  const rows = convos.map((c) => {
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
      preview = `Referral Request · ${statusLabel(deriveCurrentStatus(lastReq, statusUpdates))}`
    }
    const unread =
      role === 'referrer' && reqs.some((r) => !seenRequestIds.includes(r.id))
    if (unread) preview = `New Referral Request · ${lastReq!.jobTitleSnapshot}`
    return { member: c, name: role === 'referrer' ? ME.name : c.name, preview, lastAt, unread }
  }).sort((a, b) => b.lastAt - a.lastAt)

  // ?c= is the open conversation. Without it, desktop defaults to Alex while
  // phones show the list first and open a thread as its own screen.
  const openId = params.get('c')
  const selected = openId ?? RECIPIENT.id
  const select = (id: string) => setParams({ c: id })
  const backToList = () => setParams({})

  // As the referrer, opening a conversation marks its incoming referral requests
  // as seen — which clears the Messaging badge (inbox behaviour).
  useEffect(() => {
    if (role !== 'referrer') return
    // On phones nothing is open until a conversation is tapped.
    if (!openId && !window.matchMedia('(min-width: 768px)').matches) return
    const ids = referralRequests
      .filter((r) => r.recipientId === selected)
      .map((r) => r.id)
    markRequestsSeen(ids)
  }, [role, openId, selected, referralRequests, markRequestsSeen])

  return (
    <div className="animate-fade-in mx-auto max-w-6xl md:px-4 md:py-6">
      <div className="grid h-[calc(100dvh-var(--chrome-h))] min-h-[400px] grid-cols-1 overflow-hidden bg-surface md:h-[calc(100vh-var(--chrome-h)-88px)] md:min-h-[520px] md:rounded-card md:border md:shadow-card md:grid-cols-[minmax(280px,340px)_minmax(0,1fr)]">
        {/* Conversation list */}
        <div className={`min-h-0 flex-col border-r border-line ${openId ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex items-center gap-2 border-b border-line px-3 py-2.5">
            {/* Phones: LinkedIn app inbox header (back, search, compose) */}
            <Link
              to="/"
              aria-label="Back to Home"
              className="-ml-1 rounded-full p-1 text-ink-muted hover:bg-black/5 hover:text-ink md:hidden"
            >
              <ArrowLeft size={22} />
            </Link>
            <h1 className="sr-only text-[16px] font-semibold text-ink md:not-sr-only">Messaging</h1>
            <div className="relative flex min-w-0 flex-1 items-center md:ml-auto md:flex-none">
              <Search size={16} className="pointer-events-none absolute left-2.5 text-ink-muted" />
              <input
                placeholder="Search messages"
                aria-label="Search messages"
                className="w-full rounded bg-[#edf3f8] py-1.5 pl-8 pr-2 text-[15px] outline-none placeholder:text-ink-muted md:w-40 md:text-[13px]"
              />
            </div>
            {role === 'requester' && (
              <button
                onClick={() => navigate('/jobs')}
                aria-label="New referral from Job Tracker"
                title="Ask for a referral from your Job Tracker"
                className="rounded-full p-1.5 text-ink-muted hover:bg-black/5 hover:text-ink"
              >
                <PenSquare size={20} />
              </button>
            )}
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            {rows.map(({ member, name, preview, lastAt, unread }) => (
              <ConvoRow
                key={member.id}
                name={name}
                preview={preview}
                unread={unread}
                when={lastAt ? formatTimestamp(new Date(lastAt).toISOString()) : ''}
                active={openId === member.id}
                // With no ?c=, desktop still opens Alex by default, but phones show
                // only the list, so the default highlight is desktop-only.
                desktopOnlyActive={!openId && selected === member.id}
                onClick={() => select(member.id)}
              />
            ))}
          </ul>
        </div>

        {/* Right pane — the selected conversation */}
        <div className={`min-h-0 ${openId ? 'block' : 'hidden md:block'}`}>
          <ThreadView peerId={selected} onBack={backToList} />
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
  desktopOnlyActive = false,
  unread = false,
  onClick,
}: {
  name: string
  preview: string
  unread?: boolean
  when: string
  active: boolean
  desktopOnlyActive?: boolean
  onClick: () => void
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-start gap-3 border-b border-line border-l-2 px-3 py-3 text-left transition-colors ${
          active
            ? 'border-l-accent bg-[#eef3f8]'
            : desktopOnlyActive
              ? 'border-l-transparent hover:bg-surface-hover md:border-l-accent md:bg-[#eef3f8] md:hover:bg-[#eef3f8]'
              : 'border-l-transparent hover:bg-surface-hover'
        }`}
      >
        <Avatar name={name} size={56} />
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[16px] font-semibold text-ink md:text-sm">{name}</span>
            <span className="shrink-0 text-[12px] text-ink-muted">{when}</span>
          </div>
          <div className="flex items-center gap-2">
            <p
              className={`min-w-0 flex-1 truncate text-[14px] md:text-[13px] ${
                unread ? 'font-semibold text-ink' : 'text-ink-muted'
              }`}
            >
              {preview}
            </p>
            {unread && (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" aria-label="Unread" />
            )}
          </div>
        </div>
      </button>
    </li>
  )
}
