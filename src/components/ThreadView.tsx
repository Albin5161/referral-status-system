import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Image, MessageSquare, Paperclip, Plus, Send, Smile } from 'lucide-react'
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
export function ThreadView({ peerId, onBack }: { peerId: string; onBack?: () => void }) {
  const { role, threadMessages, referralRequests, sendMessage } = useApp()
  const navigate = useNavigate()
  const [draft, setDraft] = useState('')

  const peer = memberById(peerId)
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
        {/* Phones: the thread is its own screen, so it needs a way back to the list */}
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back to conversations"
            className="-ml-1 rounded-full p-1 text-ink-muted hover:bg-black/5 hover:text-ink md:hidden"
          >
            <ArrowLeft size={22} />
          </button>
        )}
        <Avatar name={other?.name ?? ''} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold text-ink">{other?.name}</p>
          <p className="truncate text-[12px] text-ink-muted">
            {other?.id === ME.id
              ? 'UX Designer'
              : other?.headline || other?.degree || 'Connection'}
          </p>
        </div>
        {/* Entry Point 1 (canonical): compose from the Alex Johnson thread. */}
        {role === 'requester' && peerId === RECIPIENT.id && (
          <button
            onClick={() => navigate('/compose')}
            data-tour="compose-btn"
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full bg-accent px-3.5 py-1.5 text-[13px] font-semibold text-white transition-colors hover:bg-accent-hover"
          >
            <Plus size={15} />
            <span className="sm:hidden">Compose</span>
            <span className="hidden sm:inline">Compose new message</span>
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
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
        {items.map((item, index) => {
          if (item.kind === 'request') {
            return (
              <ReferralRequestCard
                key={item.id}
                request={referralRequests.find((r) => r.id === item.id)!}
              />
            )
          }
          // LinkedIn messages are flat, not bubbles: a sender header (avatar, name,
          // time) followed by the text. Back-to-back messages from the same person
          // within 10 minutes share one header.
          const prev = items[index - 1]
          const grouped =
            prev?.kind === 'message' &&
            prev.senderId === item.senderId &&
            new Date(item.at).getTime() - new Date(prev.at).getTime() < 10 * 60 * 1000
          const senderName = memberById(item.senderId)?.name ?? ''
          return (
            <div key={item.id} className={`flex gap-2 ${grouped ? '-mt-2' : ''}`}>
              {grouped ? (
                <span className="w-8 shrink-0" aria-hidden />
              ) : (
                <Avatar name={senderName} size={32} />
              )}
              <div className="min-w-0 flex-1">
                {!grouped && (
                  <p className="text-sm leading-5">
                    <span className="font-semibold text-ink">{senderName}</span>
                    <span className="text-[12px] text-ink-muted"> · {formatTimestamp(item.at)}</span>
                  </p>
                )}
                <p className="whitespace-pre-wrap text-sm leading-5 text-ink">{item.body}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Reply box. Phones: LinkedIn app single row (attach, field, send). */}
      <div className="flex items-center gap-2 border-t border-line px-3 py-2 md:hidden">
        <span className="text-ink-muted" aria-hidden>
          <Paperclip size={22} />
        </span>
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submitDraft()
          }}
          placeholder="Write a message…"
          aria-label="Write a message"
          className="min-w-0 flex-1 rounded bg-surface-hover px-3 py-2 text-[15px] outline-none"
        />
        <button
          onClick={submitDraft}
          disabled={!draft.trim()}
          aria-label="Send"
          className={`rounded-full p-1.5 transition-colors ${
            draft.trim() ? 'text-accent hover:bg-accent/10' : 'text-ink-muted/50'
          }`}
        >
          <Send size={22} />
        </button>
      </div>

      {/* Tablet and desktop: LinkedIn web composer */}
      <div className="hidden border-t border-line px-3 py-2.5 md:block">
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
