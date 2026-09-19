import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTour, useTourStep } from '../context/TourContext'

interface Spot {
  id: string
  top: number
  left: number
  width: number
  height: number
  radius: string
  inHeader: boolean
}

// A few targets read better with their own nudge than a generic "Tap here".
const LABELS: Record<string, string> = {
  'referrer-options': 'Choose one',
  'attach-job': 'Attach the job',
  'attach-resume': 'Attach your resume',
}

const PAD = 4

// Rings the element the tester should use next (a data-tour target named by the
// current step) with a soft pulse and a small label. For a genuine choice it
// rings every option equally under one shared label. It never blocks clicks and
// follows its targets through scrolling, resizing and screen changes.
export function TourSpotlight() {
  const { showOnboarding, feedbackOpen, resumePrompt } = useTour()
  const { targets, choice } = useTourStep()
  const [spots, setSpots] = useState<Spot[]>([])
  const key = targets.join('|')
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  useEffect(() => {
    if (showOnboarding || feedbackOpen || resumePrompt || !key) {
      setSpots([])
      return
    }
    const ids = key.split('|')
    let raf = 0
    let lastEl: Element | null = null

    // Each target id resolves to its first visible element (desktop and phone
    // headers both carry some ids).
    const visible = (id: string) => {
      const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      for (const el of document.querySelectorAll(`[data-tour="${id}"]`)) {
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        // Scrolled up under the sticky header: nothing to point at right now.
        if (!el.closest('header') && r.bottom <= header) continue
        return { id, el, r }
      }
      return null
    }

    const find = () => {
      if (choice) return ids.map(visible).filter((h) => h !== null)
      for (const id of ids) {
        const hit = visible(id)
        if (hit) return [hit]
      }
      return []
    }

    const tick = () => {
      const hits = find()
      const first = hits[0]
      if (first && first.el !== lastEl) {
        lastEl = first.el
        // Bring a new target into view if it starts off screen.
        const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        if (first.r.top < header || first.r.bottom > window.innerHeight - 64) {
          first.el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
      }
      setSpots((prev) => {
        const same =
          prev.length === hits.length &&
          hits.every(({ id, r }, i) => {
            const p = prev[i]
            return p.id === id && p.top === r.top && p.left === r.left && p.width === r.width && p.height === r.height
          })
        if (same) return prev
        return hits.map(({ id, el, r }) => {
          const br = getComputedStyle(el).borderRadius
          return {
            id,
            top: r.top,
            left: r.left,
            width: r.width,
            height: r.height,
            radius: br && br !== '0px' ? `calc(${br} + ${PAD}px)` : '10px',
            // Labels under header controls would cover the guide text, so those
            // point from the side instead.
            inHeader: Boolean(el.closest('header')),
          }
        })
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [key, choice, showOnboarding, feedbackOpen, resumePrompt])

  if (spots.length === 0) return null

  // The label anchors to the whole group, so a choice gets one neutral label.
  const top = Math.min(...spots.map((s) => s.top))
  const left = Math.min(...spots.map((s) => s.left))
  const bottom = Math.max(...spots.map((s) => s.top + s.height))
  const right = Math.max(...spots.map((s) => s.left + s.width))
  const group = { top, left, width: right - left, height: bottom - top }

  const label =
    spots.length > 1 ? 'Pick either one' : (LABELS[spots[0].id] ?? (coarse ? 'Tap here' : 'Click here'))
  const placement = spots.every((s) => s.inHeader)
    ? 'left'
    : group.top + group.height + 44 < window.innerHeight
      ? 'below'
      : 'above'
  const below = placement === 'below'
  const cx = Math.min(Math.max(group.left + group.width / 2, 64), window.innerWidth - 64)
  const labelKey = spots.map((s) => s.id).join('|')

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-hidden>
      {spots.map((spot) => (
        <div
          key={spot.id}
          className="animate-spot-pulse absolute border-2 border-accent"
          style={{
            top: spot.top - PAD,
            left: spot.left - PAD,
            width: spot.width + PAD * 2,
            height: spot.height + PAD * 2,
            borderRadius: spot.radius,
          }}
        />
      ))}
      {placement === 'left' ? (
        <div
          key={`${labelKey}-label`}
          className="absolute -translate-y-1/2"
          style={{ right: window.innerWidth - group.left + PAD + 10, top: group.top + group.height / 2 }}
        >
          <div className="animate-nudge-x">
            <span className="absolute -right-1 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rotate-45 bg-ink" />
            <span className="relative block whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-white shadow-pop">
              {label}
            </span>
          </div>
        </div>
      ) : (
        <div
          key={`${labelKey}-label`}
          className="absolute -translate-x-1/2"
          style={{
            left: cx,
            top: below ? group.top + group.height + PAD + 8 : undefined,
            bottom: below ? undefined : window.innerHeight - group.top + PAD + 8,
          }}
        >
          <div className={`animate-nudge ${below ? '' : '[animation-direction:reverse]'}`}>
            <span
              className={`absolute left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-ink ${
                below ? '-top-1' : '-bottom-1'
              }`}
            />
            <span className="relative block whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[12px] font-semibold text-white shadow-pop">
              {label}
            </span>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}
