import { Link } from 'react-router-dom'
import {
  Briefcase,
  CalendarDays,
  FileText,
  Image as ImageIcon,
  Info,
  MessageSquare,
  ThumbsUp,
  Repeat2,
  Send,
  Video,
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
    <div className="animate-fade-in mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 lg:grid-cols-[225px_minmax(0,1fr)_300px]">
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
        <div className="grid gap-2 sm:grid-cols-2">
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
        <div className="rounded-card border border-line bg-surface p-3 shadow-card">
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
          author="Priya Menon"
          headline="Product Designer · Design systems & 0→1"
          when="6h"
          body="Spent the week untangling a status model that tried to store one thing in two places. Deriving state from a single event log instead of a cached field removed a whole class of bugs. Small modeling decisions, big downstream calm."
        />
        <FeedPost
          author="Daniel Okafor"
          headline="Engineering Manager"
          when="1d"
          body="Reminder: an inferred/automatic state should always be reversible by a later human action. If your UI paints a system guess as a dead end, users stop trusting the system. Design the exits before you ship the state."
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
  author,
  headline,
  when,
  body,
}: {
  author: string
  headline: string
  when: string
  body: string
}) {
  return (
    <article className="rounded-card border border-line bg-surface shadow-card">
      <div className="flex items-start gap-2 p-3">
        <Avatar name={author} size={44} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{author}</p>
          <p className="text-[12px] leading-snug text-ink-muted">{headline}</p>
          <p className="text-[12px] text-ink-faint">{when} · Edited</p>
        </div>
      </div>
      <p className="px-3 pb-3 text-sm leading-relaxed text-ink">{body}</p>
      <div className="flex items-center justify-around border-t border-line px-2 py-1 text-ink-muted">
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
    <span className="flex cursor-default items-center gap-1.5 rounded px-3 py-2 text-[13px] font-medium">
      {icon}
      {label}
    </span>
  )
}
