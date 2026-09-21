import { load, save } from './storage'

// Demo-only preferences, for comparing design options. Nothing here is product
// behaviour, and none of it is shown to testers as a real setting.

// Which send animation plays after "Send request". Both are kept so they can be
// compared side by side; ?send=envelope or ?send=fold in the URL picks one.
export type SendStyle = 'envelope' | 'fold'

export function getSendStyle(): SendStyle {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get('send')
    if (fromUrl === 'envelope' || fromUrl === 'fold') save('demo:sendStyle', fromUrl)
  } catch {
    // ignore: fall back to the saved choice
  }
  return load<SendStyle>('demo:sendStyle', 'envelope')
}

export function setSendStyle(style: SendStyle): void {
  save('demo:sendStyle', style)
}

// ?fail=1 makes the next send fail, to see the request unfold back.
export function failNextSend(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('fail') === '1'
  } catch {
    return false
  }
}
