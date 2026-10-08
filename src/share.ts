import type { Mode } from './calc'

export type ShareData = { tally: string; tokens: number; mode: Mode; stop: string }

export function setupShare(_button: HTMLButtonElement, _card: HTMLElement) {
  return { update(_data: ShareData) {} }
}
