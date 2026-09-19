// localStorage persistence — PRD §1. All prototype state survives a refresh.

const PREFIX = 'referral-status:'

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function save<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    // ignore quota / private-mode errors — prototype only
  }
}

export function uid(prefix = 'id'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`
}

// Wipe one tester's journey so the next person starts clean. Collected feedback
// is kept: it belongs to the facilitator, not to the session.
export function clearSession(keep: string[] = ['tour:feedback']): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX) && !keep.includes(k.slice(PREFIX.length)))
      .forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore — prototype only
  }
}
