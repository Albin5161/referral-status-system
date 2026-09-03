import { initials } from '../format'

// Deterministic identity palette. NOTE (constraint bend): PRD §9 reserves color
// for actionable elements, but avatar tint signals *identity* — never status or
// action — which is what the rule actually guards against. Muted, low-chroma
// backgrounds keep the blue accent unambiguous as the "tap this" signal.
const PALETTE = [
  { bg: '#e6eef7', fg: '#2b5a8c' }, // slate blue
  { bg: '#eae7f3', fg: '#5b4b8a' }, // muted violet
  { bg: '#e7f1ec', fg: '#3d6b56' }, // sage
  { bg: '#f3e9e2', fg: '#8a5a3c' }, // clay
  { bg: '#f0e8ee', fg: '#824f70' }, // dusty rose
  { bg: '#e8eef0', fg: '#3f6670' }, // teal grey
]

function paletteFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0
  return PALETTE[Math.abs(hash) % PALETTE.length]
}

export function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  const { bg, fg } = paletteFor(name)
  return (
    <span
      className="inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        backgroundColor: bg,
        color: fg,
      }}
      aria-hidden
    >
      {initials(name)}
    </span>
  )
}
