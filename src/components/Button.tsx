import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
}

// Pill buttons — PRD §9. Primary actions turn solid blue only when actionable;
// disabled state must be visibly different (fidelity requirement).
export function Button({
  variant = 'primary',
  className = '',
  children,
  disabled,
  ...rest
}: Props) {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-full text-sm font-semibold px-4 py-1.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:cursor-not-allowed'

  const variants: Record<Variant, string> = {
    primary: disabled
      ? 'bg-black/10 text-ink-faint'
      : 'bg-accent text-white hover:bg-accent-hover',
    secondary: disabled
      ? 'border border-black/20 text-ink-faint'
      : 'border border-accent text-accent hover:bg-accent/5',
    ghost: disabled
      ? 'text-ink-faint'
      : 'text-ink-muted hover:bg-black/5',
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  )
}
