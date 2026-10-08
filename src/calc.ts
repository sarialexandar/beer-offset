// Pure math for Beer Offset. No DOM, no imports from the app.
// Every constant has a source; see the Methodology section in index.html.

export type Beer = { sizeMl: number; count: number }
export type Mode = 'naive' | 'honest'
export type Input = { beers: Beer[]; trust: number; mode: Mode }
export type Equivalent = { label: string; count: number }
export type Result = {
  beerMl: number
  waterPerPromptMl: number
  waterDeltaMl: number
  prompts: number
  tokens: number
  equivalents: Equivalent[]
}

export const STOPS = [
  { label: 'Google', ml: 0.26 },
  { label: 'Altman', ml: 0.32 },
  { label: 'UCR onsite', ml: 2.2 },
  { label: 'Viral 2023', ml: 25 },
  { label: 'Doomer', ml: 50 },
] as const

export const TOKENS_PER_PROMPT = 300
export const BREWERY_RATIO = 5
export const FULL_FOOTPRINT_RATIO = 150

export const BEER_PRESETS = [
  { id: 'can', label: 'Can', sizeMl: 330 },
  { id: 'pint', label: 'Pint', sizeMl: 500 },
  { id: 'imperial', label: 'Imperial pint', sizeMl: 568 },
  { id: 'stein', label: 'Stein', sizeMl: 1000 },
] as const

export const EQUIVALENTS = [
  { label: 'bug fixes', prompts: 5 },
  { label: 'tabs vs spaces arguments', prompts: 20 },
  { label: '"rewrite it in Rust" proposals', prompts: 200 },
] as const

const MIN_ML = STOPS[0].ml
const MAX_ML = STOPS[STOPS.length - 1].ml
const STOP_TOLERANCE = 0.1

const finite = (n: number) => (Number.isFinite(n) ? n : 0)
const clamp01 = (n: number) => Math.min(1, Math.max(0, finite(n)))
const nonNeg = (n: number) => Math.max(0, finite(n))
const noNegZero = (n: number) => (n === 0 ? 0 : n)

export function waterPerPrompt(trust: number): number {
  return MIN_ML * (MAX_ML / MIN_ML) ** clamp01(trust)
}

export function trustFor(ml: number): number {
  return clamp01(Math.log(ml / MIN_ML) / Math.log(MAX_ML / MIN_ML))
}

export function nearestStop(trust: number): { label: string; ml: number; exact: boolean } {
  const ml = waterPerPrompt(trust)
  const dist = (s: { ml: number }) => Math.abs(Math.log(s.ml / ml))
  const best = STOPS.reduce((a, b) => (dist(b) < dist(a) ? b : a))
  const exact = Math.abs(ml - best.ml) / best.ml <= STOP_TOLERANCE
  return { label: best.label, ml: best.ml, exact }
}

export function offset(input: Input): Result {
  const beerMl = input.beers.reduce((sum, b) => sum + nonNeg(b.sizeMl) * nonNeg(b.count), 0)
  const waterPerPromptMl = waterPerPrompt(input.trust)
  const waterDeltaMl = noNegZero(input.mode === 'honest' ? beerMl - beerMl * BREWERY_RATIO : beerMl)
  const prompts = noNegZero(waterDeltaMl / waterPerPromptMl)
  const tokens = noNegZero(prompts * TOKENS_PER_PROMPT)
  const equivalents = EQUIVALENTS.map(e => ({ label: e.label, count: Math.abs(prompts) / e.prompts }))
  return { beerMl, waterPerPromptMl, waterDeltaMl, prompts, tokens, equivalents }
}

// Phase 2 entry point: tokens used -> beer "earned" under the naive premise.
export function fromTokens(tokens: number, trust: number): { beerMl: number; pints: number } {
  const beerMl = (nonNeg(tokens) / TOKENS_PER_PROMPT) * waterPerPrompt(trust)
  return { beerMl, pints: beerMl / 500 }
}

const nf = new Intl.NumberFormat('en', { maximumSignificantDigits: 3 })

export function formatNumber(n: number): string {
  return nf.format(Math.round(Math.abs(finite(n))))
}
