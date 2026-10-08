import {
  BEER_PRESETS, STOPS, offset, nearestStop, trustFor, formatNumber, type Mode,
} from './calc'
import { createGlass } from './glass'
import { setupShare } from './share'

type State = { counts: Record<string, number>; trust: number; mode: Mode }

const GLASS_SCALE_ML = 2000
// Honest-mode debt is 5x the beer, so it gets its own scale or a pint already fills the bar.
const DEBT_SCALE_ML = 20000
const ICON_MINUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
const ICON_PLUS = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 8h10M8 3v10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>'
const REFERENCE = [
  { label: 'A five minute shower', ml: 65_000 },
  { label: 'One beef burger', ml: 2_400_000 },
  { label: 'One California almond', ml: 3_560 },
]

const state: State = {
  counts: Object.fromEntries(BEER_PRESETS.map(p => [p.id, 0])),
  trust: 0,
  mode: 'naive',
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T

function buildPresets() {
  const root = $('presets')
  root.innerHTML = BEER_PRESETS.map(p => `
    <div class="preset" data-id="${p.id}">
      <span class="preset-name">${p.label}</span>
      <span class="preset-size">${p.sizeMl} ml</span>
      <div class="stepper">
        <button type="button" data-delta="-1" aria-label="One fewer ${p.label.toLowerCase()}">${ICON_MINUS}</button>
        <output aria-live="off">0</output>
        <button type="button" data-delta="1" aria-label="One more ${p.label.toLowerCase()}">${ICON_PLUS}</button>
      </div>
    </div>`).join('')
  root.addEventListener('click', e => {
    const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-delta]')
    if (!btn) return
    const id = btn.closest<HTMLElement>('.preset')!.dataset.id!
    state.counts[id] = Math.max(0, state.counts[id] + Number(btn.dataset.delta))
    render()
  })
}

function buildTrustStops() {
  $('trust-stops').innerHTML = STOPS
    .map(s => `<option value="${trustFor(s.ml).toFixed(2)}" label="${s.label}"></option>`)
    .join('')
  $('trust-ticks').innerHTML = STOPS
    .map(s => `<span style="left:${(trustFor(s.ml) * 100).toFixed(1)}%">${s.label}</span>`)
    .join('')
}

function tally(): string {
  const parts = BEER_PRESETS
    .filter(p => state.counts[p.id] > 0)
    .map(p => {
      const n = state.counts[p.id]
      return `${n} ${p.label.toLowerCase()}${n === 1 ? '' : 's'}`
    })
  return parts.length ? parts.join(', ') : 'no beer at all'
}

function renderBars(deltaMl: number) {
  const you = {
    label: deltaMl < 0 ? 'Your beer, water consumed' : 'Your beer, water saved',
    ml: Math.abs(deltaMl),
    you: true,
  }
  const rows = [you, ...REFERENCE.map(r => ({ ...r, you: false }))]
  const max = Math.max(...rows.map(r => r.ml), 1)
  $('bars').innerHTML = rows.map(r => {
    const w = Math.max(0.005, r.ml / max).toFixed(4)
    return `
      <div class="bar${r.you ? ' bar-you' : ''}">
        <span class="bar-label">${r.label}</span>
        <span class="bar-track"><span class="bar-fill" style="--w:${w}"></span></span>
        <span class="bar-value">${formatNumber(r.ml / 1000)} L</span>
      </div>`
  }).join('')
}

const glass = createGlass($<HTMLCanvasElement>('glass'))
const share = setupShare($<HTMLButtonElement>('share'), $('card'))

// The switch sits far below the badge and the glass, so their state changes
// are deferred until the element scrolls into view: the visitor sees them land.
const pending = new Map<Element, () => void>()
const visible = new Set<Element>()
const io = new IntersectionObserver(entries => {
  for (const e of entries) {
    if (e.isIntersecting) {
      visible.add(e.target)
      pending.get(e.target)?.()
      pending.delete(e.target)
    } else {
      visible.delete(e.target)
    }
  }
}, { threshold: 0.4 })
io.observe($('glass'))
io.observe($('badge'))

function whenVisible(el: Element, run: () => void) {
  if (visible.has(el)) run()
  else pending.set(el, run)
}

function stampBadge(honest: boolean) {
  const badge = $('badge')
  if (!honest) { badge.classList.remove('slam'); pending.delete(badge); return }
  whenVisible(badge, () => {
    badge.classList.remove('slam')
    void badge.offsetWidth
    badge.classList.add('slam')
  })
}

function render() {
  const beers = BEER_PRESETS.map(p => ({ sizeMl: p.sizeMl, count: state.counts[p.id] }))
  const r = offset({ beers, trust: state.trust, mode: state.mode })
  const honest = state.mode === 'honest'
  const stop = nearestStop(state.trust)

  document.body.classList.toggle('honest', honest)

  for (const p of BEER_PRESETS) {
    $('presets').querySelector(`[data-id="${p.id}"] output`)!.textContent = String(state.counts[p.id])
  }

  $('trust').style.setProperty('--pct', `${(state.trust * 100).toFixed(1)}%`)
  $('trust-label').textContent = stop.exact ? stop.label : `somewhere near ${stop.label}`
  $('trust-ml').textContent = r.waterPerPromptMl.toPrecision(2)

  $('summary-naive').hidden = honest
  $('summary-honest').hidden = !honest
  $('hint-naive').hidden = honest
  $('hint-honest').hidden = !honest
  $('glass-caption-naive').hidden = honest
  $('glass-caption-honest').hidden = !honest
  $('badge').setAttribute('aria-label', honest ? 'Certified Offset Partner badge, revoked' : 'Certified Offset Partner badge')

  $('hero-verb').textContent = honest ? 'You owe the GPUs' : 'You have offset'
  $('tokens').textContent = formatNumber(r.tokens)
  $('prompts').textContent = formatNumber(r.prompts)
  $('equivalents').innerHTML = r.equivalents
    .map(e => `<li><strong>${formatNumber(e.count)}</strong> ${e.label}</li>`)
    .join('')

  renderBars(r.waterDeltaMl)

  const level = honest ? Math.abs(r.waterDeltaMl) / DEBT_SCALE_ML : r.beerMl / GLASS_SCALE_ML
  whenVisible($('glass'), () => glass.update(Math.min(1, level), state.mode, Math.abs(r.waterDeltaMl)))

  share.update({ tally: tally(), tokens: r.tokens, mode: state.mode, stop: stop.label })
}

buildPresets()
buildTrustStops()
$<HTMLInputElement>('trust').addEventListener('input', e => {
  state.trust = Number((e.target as HTMLInputElement).value)
  render()
})
$<HTMLInputElement>('honest').addEventListener('change', e => {
  state.mode = (e.target as HTMLInputElement).checked ? 'honest' : 'naive'
  render()
  stampBadge(state.mode === 'honest')
})
render()
