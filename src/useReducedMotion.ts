import { useEffect, useState } from 'react'

// The CSS guard in index.css stops keyframes and transitions, but it cannot
// stop a JS timer from changing what is on screen. Anything that loops on a
// timer checks this and holds still instead.
export function useReducedMotion(): boolean {
  const query = '(prefers-reduced-motion: reduce)'
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}
