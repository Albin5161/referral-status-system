// Demo-only switches for trying out edge cases. Nothing here is product
// behaviour, and none of it is shown to testers as a real setting.

// ?fail=1 makes the next send fail, to see the request unfold back.
export function failNextSend(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('fail') === '1'
  } catch {
    return false
  }
}
