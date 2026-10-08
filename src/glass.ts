import type { Mode } from './calc'

export type Glass = { update(level: number, mode: Mode, debtMl?: number): void }

const DURATION_MS = 600
const W = 300
const H = 420
// Glass geometry in CSS pixels: a slightly tapered pint.
const TOP = 40
const BOTTOM = 370
const LEFT = 60
const RIGHT = 240
const TAPER = 14
const DEBT_TOP = 385
const DEBT_H = 18
const WAVE_AMPLITUDE = 3
const WAVE_LENGTH = 28
// A full glass stops short of the rim so the foam band stays inside it.
const LIQUID_MAX = 0.86

export function createGlass(canvas: HTMLCanvasElement): Glass {
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    canvas.hidden = true
    return { update() {} }
  }

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.scale(dpr, dpr)

  let colors = readColors()
  let mode: Mode = 'naive'
  let fromMode: Mode = 'naive'
  let from = 0
  let target = 0
  let animStart = 0
  let phase = 0
  let raf = 0
  let debtMl = 0

  function readColors() {
    const cs = getComputedStyle(canvas)
    const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
    return {
      beer: get('--beer', '#e2a93b'),
      foam: get('--foam', '#fff6e0'),
      debt: get('--debt', '#b3261e'),
      stroke: get('--glass-stroke', '#2f3b35'),
      label: get('--on-field-2', '#b9d2c6'),
      field: get('--field', '#0b3d2e'),
      font: get('--sans', 'system-ui, sans-serif'),
    }
  }

  function xAt(y: number, side: 'left' | 'right') {
    const t = (y - TOP) / (BOTTOM - TOP)
    return side === 'left' ? LEFT + TAPER * t : RIGHT - TAPER * t
  }

  function glassPath() {
    ctx!.beginPath()
    ctx!.moveTo(LEFT, TOP)
    ctx!.lineTo(xAt(BOTTOM, 'left'), BOTTOM)
    ctx!.lineTo(xAt(BOTTOM, 'right'), BOTTOM)
    ctx!.lineTo(RIGHT, TOP)
  }

  function wavePath(baseY: number, offset: number) {
    for (let x = 0; x <= W; x += 4) {
      ctx!.lineTo(x, baseY + offset + Math.sin(x / WAVE_LENGTH + phase) * WAVE_AMPLITUDE)
    }
  }

  function draw(now: number) {
    let p = 1
    if (animStart) {
      const t = Math.min(1, (now - animStart) / DURATION_MS)
      p = 1 - (1 - t) ** 3
      if (t >= 1) animStart = 0
    }
    if (!reduced) phase += 0.04

    // Crossfade: whichever bar belongs to the old mode shrinks from `from`,
    // whichever belongs to the new mode grows to `target`.
    const grow = target * p
    const shrink = from * (1 - p)
    const sameMode = mode === fromMode
    const liquid = mode === 'naive' ? (sameMode ? from + (target - from) * p : grow) : (sameMode ? 0 : shrink)
    const debt = mode === 'honest' ? (sameMode ? from + (target - from) * p : grow) : (sameMode ? 0 : shrink)

    ctx!.clearRect(0, 0, W, H)

    if (liquid > 0) {
      const surfaceY = BOTTOM - (BOTTOM - TOP) * liquid * LIQUID_MAX
      ctx!.save()
      glassPath()
      ctx!.closePath()
      ctx!.clip()

      ctx!.beginPath()
      ctx!.moveTo(0, surfaceY)
      wavePath(surfaceY, 0)
      ctx!.lineTo(W, H)
      ctx!.lineTo(0, H)
      ctx!.closePath()
      ctx!.fillStyle = colors.beer
      ctx!.fill()

      ctx!.beginPath()
      ctx!.moveTo(0, surfaceY - 10)
      wavePath(surfaceY, -10)
      for (let x = W; x >= 0; x -= 4) {
        ctx!.lineTo(x, surfaceY + 4 + Math.sin(x / WAVE_LENGTH + phase) * WAVE_AMPLITUDE)
      }
      ctx!.closePath()
      ctx!.fillStyle = colors.foam
      ctx!.fill()
      ctx!.restore()
    }

    glassPath()
    ctx!.strokeStyle = colors.stroke
    ctx!.lineWidth = 3
    ctx!.lineJoin = 'round'
    ctx!.stroke()

    if (debt > 0) {
      const w = Math.max(4, (RIGHT - LEFT) * debt)
      ctx!.fillStyle = colors.debt
      ctx!.fillRect(LEFT, DEBT_TOP, w, DEBT_H)
      ctx!.font = `500 12px ${colors.font}`
      ctx!.textBaseline = 'middle'
      const label = `${Math.round(debtMl / 1000)} L owed`
      const textW = ctx!.measureText(label).width
      const fitsRight = LEFT + w + 8 + textW <= RIGHT
      // Beside the bar the label is light on the field; inside it, dark on the bar.
      ctx!.fillStyle = fitsRight ? colors.label : colors.field
      ctx!.textAlign = fitsRight ? 'left' : 'right'
      ctx!.fillText(label, fitsRight ? LEFT + w + 8 : LEFT + w - 8, DEBT_TOP + DEBT_H / 2)
    }

    const idleWave = !reduced && liquid > 0
    raf = animStart !== 0 || idleWave ? requestAnimationFrame(draw) : 0
  }

  // Level the current mode's bar is showing right now, so the next update
  // starts from wherever the animation got to instead of snapping.
  function shownValue() {
    if (!animStart) return target
    const t = Math.min(1, (performance.now() - animStart) / DURATION_MS)
    const p = 1 - (1 - t) ** 3
    return fromMode === mode ? from + (target - from) * p : target * p
  }

  return {
    update(level, m, debt = 0) {
      colors = readColors()
      debtMl = debt
      const shown = shownValue()
      fromMode = mode
      mode = m
      from = shown
      target = Math.max(0, Math.min(1, Number.isFinite(level) ? level : 0))
      if (reduced) {
        animStart = 0
        from = target
        fromMode = mode
      } else {
        animStart = performance.now()
      }
      if (!raf) raf = requestAnimationFrame(draw)
    },
  }
}
