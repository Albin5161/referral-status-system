import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Image, MessageSquare, Paperclip, Plus, Send, Smile } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ME, RECIPIENT, memberById } from '../sampleData'
import { Avatar } from './Avatar'
import { ReferralRequestCard } from './ReferralRequestCard'
import { formatTimestamp } from '../format'

type TimelineItem =
  | { kind: 'message'; id: string; senderId: string; body: string; at: string }
  | { kind: 'request'; id: string; at: string }

// One 1:1 conversation, scoped by peerId. Rendered inside the Messaging right
// pane. Referral requests are filtered to those addressed to this peer.
export function ThreadView({ peerId }: { peerId: string }) {
  const { role, threadMessages, referralRequests, sendMessage } = useApp()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')

  const peer = memberById(peerId)
  // The requester speaks as ME; the referrer speaks as the peer.
  const meId = role === 'requester' ? ME.id : peerId
  const other = role === 'requester' ? peer : ME

  const items: TimelineItem[] = [
    ...threadMessages
      .filter((m) => m.peerId === peerId)
      .map((m) => ({
        kind: 'message' as const,
        id: m.id,
        senderId: m.senderId,
        body: m.body,
        at: m.sentAt,
      })),
    ...referralRequests
      .filter((r) => r.recipientId === peerId)
      .map((r) => ({ kind: 'request' as const, id: r.id, at: r.createdAt })),
  ].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  const submitDraft = () => {
    if (!draft.trim()) return
    sendMessage(peerId, draft)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col">
      {/* Conversation header */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <Avatar name={other?.name ?? ''} size={40} />
        <div className="min-w-0">
          <p className="text-[15px] font-semibold text-ink">{other?.name}</p>
          <p className="text-[12px] text-ink-muted">
            {other?.id === ME.id
              ? 'UX Designer'
              : other?.headline || other?.degree || 'Connection'}
          </p>
        </div>
        {/* Entry Point 1 (canonical): compose from the Alex Johnson thread. */}
        {role === 'requester' && peerId === RECIPIENT.id && (
          <button
            onClick={() => navigate('/compose')}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <Plus size={15} />
            Compose new message
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {items.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-black/[0.04] text-ink-faint">
              <MessageSquare size={22} />
            </span>
            <p className="text-sm font-medium text-ink-muted">
              No messages yet
            </p>
            <p className="max-w-[220px] text-[12px] text-ink-faint">
              Say hello to {other?.name?.split(' ')[0]} to start the conversation.
            </p>
          </div>
        )}
        {items.map((item) => {
          if (item.kind === 'request') {
            return (
              <ReferralRequestCard
                key={item.id}
                request={referralRequests.find((r) => r.id === item.id)!}
              />
            )
          }
          const mine = item.senderId === meId
          const senderName = memberById(item.senderId)?.name ?? ''
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

      {/* Reply box */}
      <div className="border-t border-line px-3 py-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitDraft()
          }}
          placeholder="Write a message…"
          className="w-full rounded-lg bg-surface-hover px-3 py-2 text-sm outline-none"
        />
        <div className="mt-1.5 flex items-center gap-3 text-ink-muted">
          <Image size={18} />
          <Paperclip size={18} />
          <Smile size={18} />
          <button
            onClick={submitDraft}
            disabled={!draft.trim()}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-1 text-[13px] font-semibold transition-colors ${
              draft.trim()
                ? 'bg-accent text-white hover:bg-accent-hover'
                : 'bg-black/10 text-ink-faint'
            }`}
          >
            <Send size={14} />
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
