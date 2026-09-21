// The request that has just been sent, so its card can land in the thread
// instead of simply appearing. In memory only: a reload shows it at rest.
let landed: { id: string; at: number } | null = null

export function markLanded(id: string): void {
  landed = { id, at: Date.now() }
}

// A read, not a take, so it is safe to call more than once during a render.
export function isLanding(id: string): boolean {
  return landed !== null && landed.id === id && Date.now() - landed.at < 2500
}
