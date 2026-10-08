import type { Mode } from './calc'

export type Glass = { update(level: number, mode: Mode): void }

export function createGlass(_canvas: HTMLCanvasElement): Glass {
  return { update() {} }
}
