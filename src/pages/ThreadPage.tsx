import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Send } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ME, RECIPIENT } from '../sampleData'
import { Avatar } from '../components/Avatar'
import { ReferralRequestCard } from '../components/ReferralRequestCard'
import { formatTimestamp } from '../format'

type TimelineItem =
  | { kind: 'message'; id: string; senderId: string; body: string; at: string }
  | { kind: 'request'; id: string; at: string }

export function ThreadPage() {
  const { role, threadMessages, referralRequests, sendMessage } = useApp()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')

  // The other party in the conversation depends on which role is viewing.
  const me = role === 'requester' ? ME : RECIPIENT
  const other = role === 'requester' ? RECIPIENT : ME

  const items: TimelineItem[] = [
    ...threadMessages.map((m) => ({
      kind: 'message' as const,
      id: m.id,
      senderId: m.senderId,
      body: m.body,
      at: m.sentAt,
    })),
    ...referralRequests.map((r) => ({
      kind: 'request' as const,
      id: r.id,
      at: r.createdAt,
    })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  const submitDraft = () => {
    if (!draft.trim()) return
    sendMessage(draft)
    setDraft('')
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-4">
      <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
        {/* Conversation header */}
        <div className="flex items-center gap-3 border-b border-line px-4 py-3">
          <Avatar name={other.name} size={44} />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ink">{other.name}</p>
            <p className="text-[13px] text-ink-muted">
              {other.id === RECIPIENT.id ? '2nd-degree connection' : 'Connection'}
            </p>
          </div>
          {role === 'requester' && (
            <button
              onClick={() => navigate('/compose')}
              className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
            >
              <Plus size={16} />
              Compose new message
            </button>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-3 px-4 py-4">
          {items.map((item) => {
            if (item.kind === 'request') {
              return (
                <div key={item.id} className="flex flex-col gap-1">
                  <ReferralRequestCard
                    request={referralRequests.find((r) => r.id === item.id)!}
                  />
                </div>
              )
            }
            const mine = item.senderId === me.id
            const senderName = item.senderId === ME.id ? ME.name : RECIPIENT.name
            return (
              <div
                key={item.id}
                className={`flex gap-2 ${mine ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <Avatar name={senderName} size={32} />
                <div className={`max-w-[75%] ${mine ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? 'rounded-tr-sm bg-accent/10 text-ink'
                        : 'rounded-tl-sm bg-black/[0.05] text-ink'
                    }`}
                  >
                    {item.body}
                  </div>
                  <p
                    className={`mt-0.5 text-[11px] text-ink-faint ${
                      mine ? 'text-right' : 'text-left'
                    }`}
                  >
                    {formatTimestamp(item.at)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Inline reply box (plain messages, both roles) */}
        <div className="flex items-center gap-2 border-t border-line px-3 py-2.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitDraft()
            }}
            placeholder="Write a message…"
            className="flex-1 rounded-full border border-line bg-surface px-4 py-2 text-sm outline-none focus:border-accent"
          />
          <button
            onClick={submitDraft}
            disabled={!draft.trim()}
            aria-label="Send message"
            className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
              draft.trim()
                ? 'bg-accent text-white hover:bg-accent-hover'
                : 'bg-black/10 text-ink-faint'
            }`}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
