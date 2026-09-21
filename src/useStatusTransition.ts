import { useEffect, useRef, useState } from 'react'
import type { Role, StatusUpdate } from './types'
import { load, save } from './storage'

// What changed since this person last looked at this request.
//
// The status screen remembers the last update each role saw. When the latest
// update is newer, the screen plays the change: the status they last saw leaves,
// the new one arrives, and every entry they missed drops into the history. A
// refresh or a re-render never replays it; only real news does.
export interface StatusTransition {
  from?: StatusUpdate // the update they last saw, if the status has moved since
  unseenIds: Set<string> // history entries that are news to them, oldest first
}

const NONE: StatusTransition = { unseenIds: new Set() }

export function useStatusTransition(
  role: Role,
  requestId: string | undefined,
  history: StatusUpdate[],
): StatusTransition {
  const key = `seenUpdate:${role}:${requestId}`
  const latestId = history.at(-1)?.id

  // The last update this role saw, as of the first render. Held in state so
  // the renders that follow (marking notifications read, and so on) keep
  // playing the same transition instead of snapping mid-animation.
  const [seenAtMount] = useState(() => load<string | null>(key, null))
  const shownRef = useRef<string | null>(seenAtMount)
  const transitionRef = useRef<{ forId: string; fromId: string | null } | null>(null)

  if (latestId && transitionRef.current?.forId !== latestId) {
    transitionRef.current = { forId: latestId, fromId: shownRef.current }
  }

  useEffect(() => {
    if (!latestId) return
    shownRef.current = latestId
    save(key, latestId)
  }, [key, latestId])

  const t = transitionRef.current
  if (!latestId || !t || t.fromId === latestId) return NONE

  let fromIndex = history.findIndex((u) => u.id === t.fromId)
  // A requester who never opened this screen still knows one thing: they sent
  // it. So their baseline is the creation update.
  if (fromIndex === -1 && role === 'requester' && history.length > 1) fromIndex = 0
  if (fromIndex === -1) return NONE

  return {
    from: history[fromIndex],
    unseenIds: new Set(history.slice(fromIndex + 1).map((u) => u.id)),
  }
}
