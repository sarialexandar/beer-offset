import { describe, it, expect } from 'vitest'
import {
  waterPerPrompt, trustFor, nearestStop, effectiveWaterPerPrompt, offset, fromTokens, formatNumber, formatLitres,
  STOPS, TOKENS_PER_PROMPT, BREWERY_RATIO,
} from './calc'

describe('waterPerPrompt', () => {
  it('maps the slider endpoints to Google and Doomer', () => {
    expect(waterPerPrompt(0)).toBeCloseTo(0.26, 6)
    expect(waterPerPrompt(1)).toBeCloseTo(50, 6)
  })
  it('midpoint is the geometric mean (~3.6 ml)', () => {
    expect(waterPerPrompt(0.5)).toBeCloseTo(Math.sqrt(0.26 * 50), 6)
  })
  it('clamps out-of-range and NaN trust', () => {
    expect(waterPerPrompt(-3)).toBeCloseTo(0.26, 6)
    expect(waterPerPrompt(7)).toBeCloseTo(50, 6)
    expect(waterPerPrompt(NaN)).toBeCloseTo(0.26, 6)
  })
})

describe('trustFor', () => {
  it('inverts waterPerPrompt at every stop', () => {
    for (const s of STOPS) expect(waterPerPrompt(trustFor(s.ml))).toBeCloseTo(s.ml, 6)
  })
  it('clamps below and above the range', () => {
    expect(trustFor(0.001)).toBe(0)
    expect(trustFor(9999)).toBe(1)
  })
})

describe('nearestStop', () => {
  it('trust 0 is exactly Google', () => {
    expect(nearestStop(0)).toEqual({ label: 'Google', ml: 0.26, exact: true })
  })
  it('trust 1 is exactly Doomer', () => {
    expect(nearestStop(1)).toEqual({ label: 'Doomer', ml: 50, exact: true })
  })
  it('midpoint is near UCR onsite but not exact', () => {
    const s = nearestStop(0.5)
    expect(s.label).toBe('UCR onsite')
    expect(s.exact).toBe(false)
  })
  it('3% off Altman is only "near" Altman', () => {
    expect(nearestStop(trustFor(0.33))).toMatchObject({ label: 'Altman', exact: false })
  })
  it('within 2.5% of Altman snaps to Altman', () => {
    expect(nearestStop(trustFor(0.325))).toMatchObject({ label: 'Altman', exact: true })
  })
  it('one slider step (0.01) away from a stop is not exact', () => {
    expect(nearestStop(trustFor(0.32) + 0.01).exact).toBe(false)
  })
})

describe('effectiveWaterPerPrompt', () => {
  it('snaps to the stop figure when within tolerance, so label and number agree', () => {
    expect(effectiveWaterPerPrompt(trustFor(0.325))).toBe(0.32)
  })
  it('interpolates when not near a stop', () => {
    expect(effectiveWaterPerPrompt(0.5)).toBeCloseTo(Math.sqrt(0.26 * 50), 6)
  })
  it('offset uses the snapped figure', () => {
    const r = offset({ beers: [{ sizeMl: 500, count: 1 }], trust: trustFor(0.325), mode: 'naive' })
    expect(r.waterPerPromptMl).toBe(0.32)
    expect(r.prompts).toBeCloseTo(500 / 0.32, 6)
  })
})

describe('formatLitres', () => {
  it('keeps fractions below 10 L and groups large values', () => {
    expect(formatLitres(330)).toBe('0.33 L')
    expect(formatLitres(3560)).toBe('3.56 L')
    expect(formatLitres(65_000)).toBe('65 L')
    expect(formatLitres(2_400_000)).toBe('2,400 L')
    expect(formatLitres(0)).toBe('0 L')
    expect(formatLitres(-2000)).toBe('2 L')
  })
})

describe('offset', () => {
  const pint = { beers: [{ sizeMl: 500, count: 1 }], trust: 0 }

  it('naive: one pint at Google numbers funds ~1923 prompts', () => {
    const r = offset({ ...pint, mode: 'naive' })
    expect(r.beerMl).toBe(500)
    expect(r.waterPerPromptMl).toBeCloseTo(0.26, 6)
    expect(r.waterDeltaMl).toBe(500)
    expect(r.prompts).toBeCloseTo(1923.08, 1)
    expect(r.tokens).toBeCloseTo((500 / 0.26) * TOKENS_PER_PROMPT, 6)
  })

  it('honest: the same pint owes ~7692 prompts', () => {
    const r = offset({ ...pint, mode: 'honest' })
    expect(r.waterDeltaMl).toBe(500 - 500 * BREWERY_RATIO)
    expect(r.prompts).toBeCloseTo(-7692.31, 1)
    expect(r.tokens).toBeLessThan(0)
  })

  it('equivalents use the absolute prompt count divided by each cost', () => {
    const r = offset({ ...pint, mode: 'honest' })
    expect(r.equivalents.map(e => e.label)).toEqual([
      'bug fixes', 'tabs vs spaces arguments', '"rewrite it in Rust" proposals',
    ])
    expect(r.equivalents[0].count).toBeCloseTo(7692.31 / 5, 1)
    expect(r.equivalents[2].count).toBeCloseTo(7692.31 / 200, 2)
  })

  it('zero beers yields zero everything in both modes', () => {
    for (const mode of ['naive', 'honest'] as const) {
      const r = offset({ beers: [], trust: 0.7, mode })
      expect(r.beerMl).toBe(0)
      expect(r.waterDeltaMl).toBe(0)
      expect(r.prompts).toBe(0)
      expect(r.tokens).toBe(0)
      expect(Object.is(r.prompts, -0)).toBe(false)
      expect(r.equivalents.every(e => e.count === 0)).toBe(true)
    }
  })

  it('sums several beers', () => {
    const r = offset({ beers: [{ sizeMl: 330, count: 2 }, { sizeMl: 1000, count: 1 }], trust: 0, mode: 'naive' })
    expect(r.beerMl).toBe(1660)
  })

  it('clamps negative and NaN sizes and counts to zero', () => {
    const r = offset({
      beers: [{ sizeMl: -500, count: 2 }, { sizeMl: 330, count: -1 }, { sizeMl: NaN, count: 1 }],
      trust: 0, mode: 'naive',
    })
    expect(r.beerMl).toBe(0)
    expect(r.prompts).toBe(0)
  })
})

describe('fromTokens', () => {
  it('inverts offset in naive mode', () => {
    const r = offset({ beers: [{ sizeMl: 568, count: 3 }], trust: 0.3, mode: 'naive' })
    const back = fromTokens(r.tokens, 0.3)
    expect(back.beerMl).toBeCloseTo(1704, 6)
    expect(back.pints).toBeCloseTo(1704 / 500, 6)
  })
  it('clamps negative tokens', () => {
    expect(fromTokens(-100, 0.5)).toEqual({ beerMl: 0, pints: 0 })
  })
})

describe('formatNumber', () => {
  it('keeps at most three significant figures and groups digits', () => {
    expect(formatNumber(576923.07)).toBe('577,000')
    expect(formatNumber(1923.08)).toBe('1,920')
    expect(formatNumber(7.49)).toBe('7')
    expect(formatNumber(0)).toBe('0')
  })
  it('never prints -0 and never prints a sign', () => {
    expect(formatNumber(-0.2)).toBe('0')
    expect(formatNumber(-7692.31)).toBe('7,690')
  })
})
