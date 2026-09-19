// Solid navigation glyphs in the style of the LinkedIn apps (the product uses
// filled icons for primary navigation, outline icons elsewhere). Drawn on a 24px
// grid and filled with currentColor so they take the nav's active/inactive ink.

type IconProps = { size?: number; className?: string }

function Glyph({ size = 24, className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  )
}

export function HomeFill(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M12 2.6 2.5 10.3V21h7v-6.5h5V21h7V10.3z" />
    </Glyph>
  )
}

export function NetworkFill(p: IconProps) {
  return (
    <Glyph {...p}>
      <circle cx="9" cy="7" r="3.75" />
      <path d="M1.75 20.5c0-4.1 3.2-7.25 7.25-7.25s7.25 3.15 7.25 7.25z" />
      <circle cx="17.5" cy="8.25" r="2.75" />
      <path d="M16.9 13.3a5.75 5.75 0 0 1 5.35 5.7v1.5H17.9c0-2.8-.3-5.1-1-7.2z" />
    </Glyph>
  )
}

export function PostFill(p: IconProps) {
  return (
    <Glyph {...p}>
      <rect x="2.75" y="2.75" width="18.5" height="18.5" rx="3" />
      <path
        d="M12 7.25v9.5M7.25 12h9.5"
        stroke="#fff"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
    </Glyph>
  )
}

export function BellFill(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M12 2.25a6.75 6.75 0 0 0-6.75 6.75v4.4L3.25 17v1.75h17.5V17l-2-3.6V9A6.75 6.75 0 0 0 12 2.25z" />
      <path d="M9.25 20.25a2.75 2.75 0 0 0 5.5 0z" />
    </Glyph>
  )
}

export function JobsFill(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M9 3.25A1.75 1.75 0 0 0 7.25 5v1.5H4A1.75 1.75 0 0 0 2.25 8.25v4.5h19.5v-4.5A1.75 1.75 0 0 0 20 6.5h-3.25V5A1.75 1.75 0 0 0 15 3.25zm.25 2h5.5v1.25h-5.5z" />
      <path d="M2.25 14.25h8.25v1.75h3v-1.75h8.25V19A1.75 1.75 0 0 1 20 20.75H4A1.75 1.75 0 0 1 2.25 19z" />
    </Glyph>
  )
}

export function MessagingFill(p: IconProps) {
  return (
    <Glyph {...p}>
      <path d="M4.25 3.25h15.5A1.75 1.75 0 0 1 21.5 5v10.75a1.75 1.75 0 0 1-1.75 1.75H11L5.75 21.5v-4H4.25a1.75 1.75 0 0 1-1.75-1.75V5a1.75 1.75 0 0 1 1.75-1.75z" />
      <circle cx="7.75" cy="10.4" r="1.4" fill="#fff" />
      <circle cx="12" cy="10.4" r="1.4" fill="#fff" />
      <circle cx="16.25" cy="10.4" r="1.4" fill="#fff" />
    </Glyph>
  )
}

// The LinkedIn "in" logo. Used for the demo only (concept prototype, not affiliated).
export function LinkedInLogo({ size = 34, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      role="img"
      aria-label="LinkedIn"
    >
      <rect x="1" y="1" width="22" height="22" rx="2" fill="#fff" />
      <path
        fill="#0A66C2"
        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
      />
    </svg>
  )
}
