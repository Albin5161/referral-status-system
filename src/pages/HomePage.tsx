import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  CalendarDays,
  ChevronDown,
  FileText,
  Globe,
  Image as ImageIcon,
  Info,
  MessageSquare,
  MoreHorizontal,
  ThumbsUp,
  UserPlus,
  Repeat2,
  Send,
  Video,
  X,
} from 'lucide-react'
import { useApp } from '../context/AppContext'
import { ME, RECIPIENT } from '../sampleData'
import { Avatar } from '../components/Avatar'

// LinkedIn-style home feed. Content here is fictional placeholder material — the
// feed is context/scaffolding, not the feature. The referral flow lives in
// Messaging (see the demo pointer at the top of the center column).
export function HomePage() {
  const { role } = useApp()
  const me = role === 'requester' ? ME : RECIPIENT

  return (
    <div className="animate-fade-in mx-auto grid max-w-6xl grid-cols-1 gap-6 py-2 md:px-4 md:py-6 lg:grid-cols-[225px_minmax(0,1fr)_300px]">
      {/* Left rail — profile card */}
      <aside className="hidden lg:block">
        <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
          <div className="h-14 bg-gradient-to-r from-accent/30 to-accent/10" />
          <div className="-mt-8 flex flex-col items-center px-4 pb-4 text-center">
            <Avatar name={me.name} size={64} />
            <p className="mt-2 text-[15px] font-semibold text-ink">{me.name}</p>
            <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">
              {me.id === ME.id
                ? 'UX Designer · End-to-End Product Design'
                : 'Design Manager · Referrals'}
            </p>
            <p className="mt-1 text-[12px] text-ink-faint">Bengaluru, Karnataka</p>
          </div>
          <div className="border-t border-line px-4 py-2 text-[12px]">
            <StatRow label="Profile viewers" value="136" />
            <StatRow label="Post impressions" value="44" />
          </div>
          <Link
            to="/my-jobs"
            className="block border-t border-line px-4 py-2 text-[12px] font-semibold text-ink-muted hover:bg-surface-hover"
          >
            My Jobs
          </Link>
        </div>
      </aside>

      {/* Center — feed */}
      <section className="space-y-2">
        {/* Demo pointers — two entry points into the same referral flow */}
        <div className="grid gap-2 px-2 sm:grid-cols-2 md:px-0">
          <Link
            to="/messaging"
            className="flex items-center gap-3 rounded-card border border-accent/40 bg-accent/5 px-4 py-3 hover:bg-accent/10"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <MessageSquare size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                From Messaging
              </span>
              <span className="block text-[12px] text-ink-muted">
                Open your chat with Alex Johnson.
              </span>
            </span>
          </Link>
          <Link
            to="/jobs"
            className="flex items-center gap-3 rounded-card border border-accent/40 bg-accent/5 px-4 py-3 hover:bg-accent/10"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <Briefcase size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">
                From Job Tracker
              </span>
              <span className="block text-[12px] text-ink-muted">
                Ask a connection for a referral.
              </span>
            </span>
          </Link>
        </div>

        {/* Start a post */}
        <div className="hidden rounded-card border border-line bg-surface p-3 shadow-card md:block">
          <div className="flex items-center gap-2">
            <Avatar name={me.name} size={40} />
            <div className="flex-1 cursor-default rounded-full border border-line px-4 py-2.5 text-sm text-ink-muted">
              Start a post
            </div>
          </div>
          <div className="mt-2 flex items-center justify-around">
            <FeedAction icon={<Video size={18} className="text-emerald-600" />} label="Video" />
            <FeedAction icon={<ImageIcon size={18} className="text-sky-600" />} label="Photo" />
            <FeedAction icon={<FileText size={18} className="text-amber-600" />} label="Write article" />
          </div>
        </div>

        {/* Fictional feed posts (placeholder content) */}
        <FeedPost
          viewer={me.name}
          context={{ name: 'Sara Lindqvist', action: 'likes this' }}
          author="Priya Menon"
          degree="1st"
          headline="Product Designer · Design systems & 0→1"
          when="6h"
          body="Spent the week untangling a status model that tried to store one thing in two places. Deriving state from a single event log instead of a cached field removed a whole class of bugs. Small modeling decisions, big downstream calm."
          reactions="Alex Johnson and 83 others"
          comments={5}
          reposts={4}
        />
        <FeedPost
          viewer={me.name}
          context={{ name: 'Alex Johnson', action: 'commented on this' }}
          author="Daniel Okafor"
          degree="2nd"
          headline="Engineering Manager · Stripe"
          when="1d"
          body="Reminder: an inferred/automatic state should always be reversible by a later human action. If your UI paints a system guess as a dead end, users stop trusting the system. Design the exits before you ship the state."
          reactions="Priya Menon and 41 others"
          comments={12}
          reposts={3}
        />

        <p className="px-1 py-4 text-center text-[11px] text-ink-faint">
          Feed content on this page is fictional placeholder material for the concept
          prototype.
        </p>
      </section>

      {/* Right rail — news / promoted (fictional) */}
      <aside className="hidden lg:block">
        <div className="rounded-card border border-line bg-surface shadow-card">
          <div className="flex items-center justify-between px-4 pt-3">
            <h2 className="text-[15px] font-semibold text-ink">Concept News</h2>
            <Info size={14} className="text-ink-muted" />
          </div>
          <ul className="px-4 py-2">
            <NewsItem title="Teams rethink referral workflows" meta="Top story · 1,204 readers" />
            <NewsItem title="Why status should be derived, not stored" meta="3h ago" />
            <NewsItem title="Designing reversible system states" meta="5h ago" />
            <NewsItem title="Pessimistic UI is making a comeback" meta="7h ago" />
          </ul>
        </div>

        <div className="mt-2 rounded-card border border-line bg-surface p-4 text-center shadow-card">
          <p className="text-[11px] text-ink-faint">Promoted · placeholder</p>
          <div className="mx-auto mt-2 grid h-10 w-10 place-items-center rounded-full bg-accent/10 text-accent">
            <CalendarDays size={18} />
          </div>
          <p className="mt-2 text-[13px] font-semibold text-ink">
            Keep your job search organized
          </p>
          <Link
            to="/my-jobs"
            className="mt-2 inline-block rounded-full border border-accent px-4 py-1 text-[13px] font-semibold text-accent hover:bg-accent/5"
          >
            View My Jobs
          </Link>
        </div>
      </aside>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-ink-muted">{label}</span>
      <span className="font-semibold text-accent">{value}</span>
    </div>
  )
}

function FeedAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex cursor-default items-center gap-1.5 rounded px-3 py-1.5 text-[13px] font-medium text-ink-muted">
      {icon}
      {label}
    </span>
  )
}

function NewsItem({ title, meta }: { title: string; meta: string }) {
  return (
    <li className="cursor-default py-1.5">
      <p className="text-[13px] font-semibold leading-snug text-ink">{title}</p>
      <p className="text-[12px] text-ink-faint">{meta}</p>
    </li>
  )
}

function FeedPost({
  viewer,
  context,
  author,
  degree,
  headline,
  when,
  body,
  reactions,
  comments,
  reposts,
}: {
  viewer: string
  context?: { name: string; action: string }
  author: string
  degree: string
  headline: string
  when: string
  body: string
  reactions: string
  comments: number
  reposts: number
}) {
  const [expanded, setExpanded] = useState(false)

  // Phones: edge-to-edge post like the LinkedIn app. md+: the web card.
  return (
    <article className="border-y border-line bg-surface md:rounded-card md:border md:shadow-card">
      {/* Network activity that surfaced this post */}
      {context && (
        <div className="mx-3 flex items-center gap-2 border-b border-line py-2 text-[13px] text-ink-muted">
          <Avatar name={context.name} size={24} />
          <p className="min-w-0 flex-1 truncate">
            <span className="font-semibold text-ink">{context.name}</span> {context.action}
          </p>
          <span className="flex shrink-0 items-center gap-3" aria-hidden>
            <MoreHorizontal size={18} />
            <X size={18} />
          </span>
        </div>
      )}

      <div className="flex items-start gap-2 p-3">
        <Avatar name={author} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-ink">
            <span className="font-semibold">{author}</span>
            <span className="text-ink-muted"> · {degree}</span>
          </p>
          <p className="truncate text-[12px] leading-snug text-ink-muted">{headline}</p>
          <p className="flex items-center gap-1 text-[12px] text-ink-muted">
            {when} · <Globe size={12} aria-hidden />
          </p>
        </div>
        {degree !== '1st' && (
          <span className="inline-flex shrink-0 cursor-default items-center gap-1 text-sm font-semibold text-accent">
            <UserPlus size={16} />
            Connect
          </span>
        )}
      </div>

      <div className="px-3 pb-2">
        <p
          className={`text-sm leading-relaxed text-ink ${
            expanded ? '' : 'line-clamp-3 md:line-clamp-none'
          }`}
        >
          {body}
        </p>
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="text-sm text-ink-muted hover:text-accent md:hidden"
          >
            …more
          </button>
        )}
      </div>

      {/* Social proof */}
      <div className="mx-3 flex items-center justify-between gap-2 border-b border-line py-2 text-[12px] text-ink-muted">
        <span className="flex min-w-0 items-center gap-1">
          <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent text-white">
            <ThumbsUp size={9} />
          </span>
          <span className="truncate">{reactions}</span>
        </span>
        <span className="shrink-0">
          {comments} comments · {reposts} reposts
        </span>
      </div>

      <div className="flex items-center justify-around px-1 py-1 text-ink-muted">
        <span className="flex items-center gap-0.5 md:hidden" aria-hidden>
          <Avatar name={viewer} size={24} />
          <ChevronDown size={14} />
        </span>
        <PostAction icon={<ThumbsUp size={18} />} label="Like" />
        <PostAction icon={<MessageSquare size={18} />} label="Comment" />
        <PostAction icon={<Repeat2 size={18} />} label="Repost" />
        <PostAction icon={<Send size={18} />} label="Send" />
      </div>
    </article>
  )
}

function PostAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex cursor-default flex-col items-center gap-0.5 rounded px-2 py-1.5 text-[12px] font-semibold md:flex-row md:gap-1.5 md:px-3 md:py-2 md:text-[13px] md:font-medium">
      {icon}
      {label}
    </span>
  )
}
