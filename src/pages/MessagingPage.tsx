import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MoreHorizontal, PenSquare, Search } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ME, RECIPIENT } from '../sampleData'
import { Avatar } from '../components/Avatar'
import { ThreadView } from '../components/ThreadView'
import { formatTimestamp } from '../format'

// Placeholder conversations — fictional, inert. Only the Alex Johnson thread is
// wired to the referral flow. Selecting a placeholder shows a muted notice.
const PLACEHOLDER_CONVOS = [
  { id: 'c-priya', name: 'Priya Menon', preview: 'Thanks for connecting!', when: 'Aug 28' },
  { id: 'c-daniel', name: 'Daniel Okafor', preview: 'Let’s catch up next week.', when: 'Aug 21' },
  { id: 'c-sara', name: 'Sara Lindqvist', preview: 'Great, talk soon.', when: 'Aug 14' },
]

const ALEX_CONVO_ID = 'c-alex'

export function MessagingPage() {
  const { role, threadMessages } = useApp()
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string>(ALEX_CONVO_ID)

  const lastMsg = threadMessages.at(-1)
  const alexPreview = lastMsg
    ? `${lastMsg.senderId === ME.id ? 'You: ' : ''}${lastMsg.body}`
    : 'Say hello'

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
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
                onClick={() => navigate('/compose')}
                aria-label="Compose new message"
                className="rounded-full p-1.5 text-ink-muted hover:bg-black/5 hover:text-ink"
              >
                <PenSquare size={18} />
              </button>
            )}
          </div>

          <ul className="min-h-0 flex-1 overflow-y-auto">
            <ConvoRow
              name={RECIPIENT.name}
              preview={alexPreview}
              when={lastMsg ? formatTimestamp(lastMsg.sentAt) : ''}
              active={selected === ALEX_CONVO_ID}
              onClick={() => setSelected(ALEX_CONVO_ID)}
            />
            {PLACEHOLDER_CONVOS.map((c) => (
              <ConvoRow
                key={c.id}
                name={c.name}
                preview={c.preview}
                when={c.when}
                active={selected === c.id}
                onClick={() => setSelected(c.id)}
              />
            ))}
          </ul>
        </div>

        {/* Right pane */}
        <div className="min-h-0">
          {selected === ALEX_CONVO_ID ? (
            <ThreadView />
          ) : (
            <PlaceholderPane
              name={
                PLACEHOLDER_CONVOS.find((c) => c.id === selected)?.name ?? ''
              }
            />
          )}
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
        className={`flex w-full items-start gap-3 border-b border-line px-3 py-3 text-left transition-colors ${
          active ? 'bg-[#eef3f8]' : 'hover:bg-surface-hover'
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

function PlaceholderPane({ name }: { name: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Avatar name={name} size={40} />
        <p className="text-[15px] font-semibold text-ink">{name}</p>
        <MoreHorizontal size={18} className="ml-auto text-ink-muted" />
      </div>
      <div className="flex flex-1 items-center justify-center px-6 text-center">
        <p className="max-w-xs text-sm text-ink-muted">
          This is a placeholder conversation and is not part of the prototype.
          Select <span className="font-semibold text-ink">Alex Johnson</span> to try
          the Referral Status flow.
        </p>
      </div>
    </div>
  )
}
