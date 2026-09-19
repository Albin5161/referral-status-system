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
// current step) with a soft pulse and a small label. It never blocks clicks and
// follows the element through scrolling, resizing and screen changes.
export function TourSpotlight() {
  const { showOnboarding, feedbackOpen, resumePrompt } = useTour()
  const { targets } = useTourStep()
  const [spot, setSpot] = useState<Spot | null>(null)
  const key = targets.join('|')
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

  useEffect(() => {
    if (showOnboarding || feedbackOpen || resumePrompt || !key) {
      setSpot(null)
      return
    }
    const ids = key.split('|')
    let raf = 0
    let lastEl: Element | null = null

    const find = () => {
      const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      for (const id of ids) {
        for (const el of document.querySelectorAll(`[data-tour="${id}"]`)) {
          const r = el.getBoundingClientRect()
          if (r.width === 0 || r.height === 0) continue
          // Scrolled up under the sticky header: nothing to point at right now.
          if (!el.closest('header') && r.bottom <= header) continue
          return { id, el, r }
        }
      }
      return null
    }

    const tick = () => {
      const hit = find()
      if (hit && hit.el !== lastEl) {
        lastEl = hit.el
        // Bring a new target into view if it starts off screen.
        const header = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
        if (hit.r.top < header || hit.r.bottom > window.innerHeight - 64) {
          hit.el.scrollIntoView({ block: 'center', behavior: 'smooth' })
        }
      }
      setSpot((prev) => {
        if (!hit) return null
        const { r } = hit
        if (
          prev &&
          prev.id === hit.id &&
          prev.top === r.top &&
          prev.left === r.left &&
          prev.width === r.width &&
          prev.height === r.height
        )
          return prev
        const br = getComputedStyle(hit.el).borderRadius
        return {
          id: hit.id,
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height,
          radius: br && br !== '0px' ? `calc(${br} + ${PAD}px)` : '10px',
          // Labels under header controls would cover the guide text, so those
          // point from the side instead.
          inHeader: Boolean(hit.el.closest('header')),
        }
      })
      raf = requestAnimationFrame(tick)
    }
    tick()
    return () => cancelAnimationFrame(raf)
  }, [key, showOnboarding, feedbackOpen, resumePrompt])

  if (!spot) return null

  const label = LABELS[spot.id] ?? (coarse ? 'Tap here' : 'Click here')
  const placement = spot.inHeader
    ? 'left'
    : spot.top + spot.height + 44 < window.innerHeight
      ? 'below'
      : 'above'
  const below = placement === 'below'
  const cx = Math.min(Math.max(spot.left + spot.width / 2, 64), window.innerWidth - 64)

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[45]" aria-hidden>
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
      {placement === 'left' ? (
        <div
          key={`${spot.id}-label`}
          className="absolute -translate-y-1/2"
          style={{ right: window.innerWidth - spot.left + PAD + 10, top: spot.top + spot.height / 2 }}
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
          key={`${spot.id}-label`}
          className="absolute -translate-x-1/2"
          style={{
            left: cx,
            top: below ? spot.top + spot.height + PAD + 8 : undefined,
            bottom: below ? undefined : window.innerHeight - spot.top + PAD + 8,
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
