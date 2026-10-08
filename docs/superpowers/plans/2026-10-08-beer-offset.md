# Beer Offset Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A static single-page joke site that converts beer drunk into AI tokens "offset", styled as a corporate sustainability report that breaks character, with an honest-mode flip, an animated glass, and a shareable PNG.

**Architecture:** Vite + TypeScript, no framework. One pure calc module (`src/calc.ts`) does all the math; `src/main.ts` holds `{counts, trust, mode}` state and a single `render()`; `src/glass.ts` draws the canvas hero; `src/share.ts` exports a PNG. Impeccable runs once, after the page works, to replace the baseline CSS with the real visual world.

**Tech Stack:** Vite, TypeScript, Vitest, `html-to-image`, Canvas 2D, GitHub Pages via Actions.

**Spec:** `docs/superpowers/specs/2026-10-08-beer-offset-design.md`

## Global Constraints

- Metric only. All constants in ml; litres only in display copy.
- Constants and their values, verbatim from the spec: trust stops Google 0.26, Altman 0.32, UCR onsite 2.2, Viral 2023 25, Doomer 50 ml; `TOKENS_PER_PROMPT` 300; `BREWERY_RATIO` 5; `FULL_FOOTPRINT_RATIO` 150 (footnote only); presets can 330, pint 500, imperial pint 568, stein 1000; equivalents bug fix 5, tabs-vs-spaces argument 20, "rewrite it in Rust" 200 prompts; glass scale 2,000 ml; reference bars shower 65,000, burger 2,400,000, almond 3,560 ml.
- `waterPerPrompt(trust) = 0.26 * (50 / 0.26) ** trust`, trust clamped to [0, 1].
- `calc.ts` imports nothing from the DOM or the rest of the app.
- No runtime network calls. No backend, no analytics, no persistence.
- Dependencies: `vite`, `typescript`, `vitest` (dev) and `html-to-image` (runtime). Nothing else.
- Native controls: `<input type="range">` for trust, `<input type="checkbox">` for the toggle, `<button>` for steppers. Every control has a label.
- Mobile first, no horizontal scroll at 375px wide. `prefers-reduced-motion` disables the idle wave and animations.
- Methodology section is sincere and does not joke. Footer copy exactly: "Beer Offset is not a registered offset program. Nothing is. Please also drink water."
- Commit messages: bare conventional prefix (`feat:`, `fix:`, `chore:`, `docs:`), no scope in parentheses, no `Co-Authored-By` or session trailers (user's global CLAUDE.md).
- Node 22 locally and in CI.

## Review Focus

1. Stepper spammed to hundreds of steins (e.g., 400 × 1,000 ml): the headline number must stay three significant figures and the glass must cap at full. Pinned by `formatNumber` tests in Task 2 and the `level` clamp test note in Task 4.
2. Honest mode with zero beers: must read "You owe the GPUs 0 tokens", no `NaN`, no `-0`. Pinned by the zero-beer honest test in Task 2 and `Math.abs` in `render()`.
3. Trust slider dragged to a value just off a stop (e.g., 0.33 ml): readout must say "somewhere near Altman", not claim an exact source. Pinned by the `nearestStop` tolerance tests in Task 2.
4. Share on a desktop browser without Web Share: must download `beer-offset.png`; on export failure the button must show the fallback text. Pinned by the manual step list in Task 5 (no unit test; `html-to-image` needs a real browser).
5. Reduced motion: level changes must jump, no idle wave, no `requestAnimationFrame` loop left running. Pinned by the manual check in Task 4 and the impeccable screenshot round in Task 6.

---

### Task 1: Scaffold Vite + TypeScript + Vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `.gitignore`, `index.html`, `src/main.ts`, `.claude/launch.json`

**Interfaces:**
- Produces: `npm run dev`, `npm test`, `npm run build` scripts; `BASE_PATH` env var read by Vite config.

- [ ] **Step 1: Create package.json and install dependencies**

Run from the project root:

```bash
cat > package.json <<'JSON'
{
  "name": "beer-offset",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview",
    "test": "vitest run"
  }
}
JSON
npm install --save-dev vite typescript vitest
npm install html-to-image
```

- [ ] **Step 2: Write tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

`vite.config.ts` is deliberately not included: Vite compiles it itself, and `process.env` there would need `@types/node`, which we are not adding.

- [ ] **Step 3: Write vite.config.ts**

```ts
import { defineConfig } from 'vite'

// BASE_PATH is set by the Pages workflow to "/<repo-name>/"; locally it is "/".
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
})
```

- [ ] **Step 4: Write .gitignore and .env**

`.gitignore`:

```
node_modules
dist
```

`.env` (committed; it holds no secrets, only the local site URL used in the OG tag):

```
VITE_SITE_URL=http://localhost:5173/
```

Vite replaces `%VITE_SITE_URL%` in `index.html` from this file locally. A real environment variable with the same name, as set in the Pages workflow, takes precedence over `.env`.

- [ ] **Step 5: Write a minimal index.html and main.ts**

`index.html`:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Beer Offset</title>
</head>
<body>
  <h1>Beer Offset</h1>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

`src/main.ts`:

```ts
console.log('beer offset')
```

- [ ] **Step 6: Write .claude/launch.json for the browser pane**

```json
{
  "version": "0.0.1",
  "configurations": [
    {
      "name": "beer-offset",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev", "--", "--port", "5173", "--strictPort"],
      "port": 5173
    }
  ]
}
```

- [ ] **Step 7: Verify build and test runner**

Run: `npm run build`
Expected: `dist/index.html` exists, no TypeScript errors.

Run: `npm test`
Expected: vitest exits 0 with "No test files found" (or similar, exit code 0). If vitest exits 1 on no test files, that is fine for now; Task 2 adds the first test.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json tsconfig.json vite.config.ts .gitignore .env index.html src/main.ts .claude/launch.json
git commit -m "chore: scaffold vite, typescript and vitest"
```

---

### Task 2: Pure calculation module

**Files:**
- Create: `src/calc.ts`
- Test: `src/calc.test.ts`

**Interfaces:**
- Produces (all exported from `src/calc.ts`):
  - `type Beer = { sizeMl: number; count: number }`
  - `type Mode = 'naive' | 'honest'`
  - `type Input = { beers: Beer[]; trust: number; mode: Mode }`
  - `type Result = { beerMl: number; waterPerPromptMl: number; waterDeltaMl: number; prompts: number; tokens: number; equivalents: { label: string; count: number }[] }`
  - `const STOPS: readonly { label: string; ml: number }[]`
  - `const TOKENS_PER_PROMPT = 300`, `const BREWERY_RATIO = 5`, `const FULL_FOOTPRINT_RATIO = 150`
  - `const BEER_PRESETS: readonly { id: string; label: string; sizeMl: number }[]`
  - `const EQUIVALENTS: readonly { label: string; prompts: number }[]`
  - `function waterPerPrompt(trust: number): number`
  - `function trustFor(ml: number): number` (inverse of `waterPerPrompt`, clamped to [0, 1])
  - `function nearestStop(trust: number): { label: string; ml: number; exact: boolean }` (`exact` = within 10% of the stop)
  - `function offset(input: Input): Result`
  - `function fromTokens(tokens: number, trust: number): { beerMl: number; pints: number }`
  - `function formatNumber(n: number): string` (rounded, at most 3 significant figures, `en` grouping, never `-0`)

- [ ] **Step 1: Write the failing tests**

`src/calc.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  waterPerPrompt, trustFor, nearestStop, offset, fromTokens, formatNumber,
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
  it('within 10% of Altman counts as exact', () => {
    expect(nearestStop(trustFor(0.33))).toMatchObject({ label: 'Altman', exact: true })
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
    expect(r.tokens).toBeCloseTo(1923.08 * TOKENS_PER_PROMPT, 0)
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
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm test`
Expected: FAIL, "Failed to resolve import ./calc" or similar module-not-found error.

- [ ] **Step 3: Write src/calc.ts**

```ts
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
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm test`
Expected: PASS, all tests in `src/calc.test.ts` green.

If `formatNumber(7.49)` fails: `Math.round(7.49)` is 7, so the expectation holds; if it prints `7` with a different grouping, check the `en` locale is available in Node (it is in Node 22 by default).

- [ ] **Step 5: Commit**

```bash
git add src/calc.ts src/calc.test.ts
git commit -m "feat: add pure offset calculation with tests"
```

---

### Task 3: Page structure, state, and render

**Files:**
- Modify: `index.html` (replace the Task 1 stub entirely)
- Modify: `src/main.ts` (replace the Task 1 stub entirely)
- Create: `src/styles.css` (baseline, replaced by impeccable in Task 6)

**Interfaces:**
- Consumes: everything exported from `src/calc.ts` (Task 2).
- Consumes (stubbed here, real in Tasks 4 and 5): `createGlass(canvas: HTMLCanvasElement): { update(level: number, mode: Mode): void }` from `src/glass.ts`, and `setupShare(button: HTMLButtonElement, card: HTMLElement): { update(data: ShareData): void }` from `src/share.ts` where `ShareData = { tally: string; tokens: number; mode: Mode; stop: string }`.
- Produces: the DOM ids listed in Step 1, which Tasks 4 to 6 rely on: `badge`, `summary-naive`, `summary-honest`, `presets`, `trust`, `trust-stops`, `trust-label`, `trust-ml`, `glass`, `hero-verb`, `tokens`, `prompts`, `equivalents`, `share`, `bars`, `honest`, `card`.

- [ ] **Step 1: Write index.html**

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Beer Offset</title>
  <meta name="description" content="Offset your prompts. One pint at a time.">
  <meta property="og:title" content="Beer Offset — 2026 Sustainability Impact Report">
  <meta property="og:description" content="Offset your prompts. One pint at a time.">
  <meta property="og:image" content="%VITE_SITE_URL%og.png">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/src/styles.css">
</head>
<body>
  <header class="masthead">
    <div class="badge" id="badge">
      <span class="badge-text">Certified<br>Offset<br>Partner</span>
      <span class="stamp" aria-hidden="true">REVOKED</span>
    </div>
    <h1>Beer Offset</h1>
    <p class="subtitle">2026 Sustainability Impact Report</p>
  </header>

  <main>
    <section class="summary" aria-labelledby="summary-h">
      <h2 id="summary-h">Executive summary</h2>
      <p id="summary-naive">Beer Offset empowers stakeholders to transform discretionary beverage consumption into measurable compute-sector water resilience. Every litre not consumed as water is a litre available to our partners' thermal management infrastructure. Together, we are closing the loop.</p>
      <p id="summary-honest" hidden>Brewing one litre of beer uses about five litres of water. We were hoping you would not ask.</p>
    </section>

    <section class="contribution" aria-labelledby="contrib-h">
      <h2 id="contrib-h">Report your contribution</h2>
      <div class="presets" id="presets"></div>
      <div class="trust">
        <label for="trust">Methodology confidence</label>
        <input type="range" id="trust" min="0" max="1" step="0.01" value="0" list="trust-stops">
        <datalist id="trust-stops"></datalist>
        <div class="trust-ends" aria-hidden="true"><span>Google</span><span>Doomer</span></div>
        <p class="trust-readout">Using <strong id="trust-label">Google</strong>: <span id="trust-ml">0.26</span> ml of water per prompt</p>
      </div>
    </section>

    <section class="hero" aria-live="polite">
      <canvas id="glass" width="300" height="420" aria-label="A beer glass showing your offset level"></canvas>
      <div class="hero-text">
        <p class="hero-verb" id="hero-verb">You have offset</p>
        <p class="hero-number"><span id="tokens">0</span> tokens</p>
        <p class="hero-sub">That is <span id="prompts">0</span> prompts, or</p>
        <ul class="equivalents" id="equivalents"></ul>
        <button type="button" id="share" class="share">Share your impact</button>
      </div>
    </section>

    <section class="impact" aria-labelledby="impact-h">
      <h2 id="impact-h">Impact breakdown</h2>
      <div class="bars" id="bars"></div>
    </section>

    <section class="disclosure">
      <label class="switch">
        <input type="checkbox" id="honest">
        <span class="switch-track" aria-hidden="true"></span>
        <span class="switch-label">Full disclosure</span>
      </label>
      <p class="switch-hint">Enable to apply our complete water accounting framework.</p>
    </section>

    <section class="methodology" aria-labelledby="method-h">
      <h2 id="method-h">Methodology</h2>
      <p>Nobody agrees on how much water a single AI prompt uses. Published estimates differ by more than a hundred times, mostly because they disagree on what to count. The slider above lets you pick whose number you believe. Every figure below is modelled, not metered.</p>
      <dl>
        <dt>0.26 ml per prompt (Google)</dt>
        <dd>Google's August 2025 technical report, median Gemini text prompt. Counts on-site cooling water only. Excludes water used to generate electricity, training, and networking.</dd>
        <dt>0.32 ml per prompt (Altman)</dt>
        <dd>Sam Altman's 2025 blog figure of 0.000085 gallons per ChatGPT query. A company statement, not an independent measurement.</dd>
        <dt>2.2 ml per prompt (UCR onsite)</dt>
        <dd>Shaolei Ren and colleagues at UC Riverside, on-site water for an average US data centre per request.</dd>
        <dt>25 ml per prompt (Viral 2023)</dt>
        <dd>Midpoint of the 2023 "a 500 ml bottle per 10 to 50 responses" estimate for a GPT-3 era deployment. This is the origin of the "bottle of water per chat" claim. Its own authors now consider it high for current models.</dd>
        <dt>50 ml per prompt (Doomer)</dt>
        <dd>UC Riverside's figure once the water evaporated at power plants to generate the electricity is included. Indirect water can be more than half of the total.</dd>
        <dt>300 tokens per prompt</dt>
        <dd>Our assumption for a median chat exchange. Change it in your head as needed.</dd>
        <dt>5 litres of water per litre of beer</dt>
        <dd>Brewery-only water use, reported at 3 to 10 litres per litre by Grundfos, MIT Sloan, and Asahi. Full disclosure mode uses this. If you also count growing the barley and hops, WWF and SABMiller put it at 60 to 300 litres per litre. We use 150 for that footnote and have chosen not to put it in the calculator, for your sake.</dd>
        <dt>Reference bars</dt>
        <dd>A five minute shower at about 65 litres; a beef burger at roughly 2,400 litres (a common water-footprint figure, approximate); one California almond at 3.56 litres (2019 study).</dd>
      </dl>
      <p>What this page does not say: that AI water use does not matter. Totals matter, and where data centres are built matters more than any per-prompt number. What it does say: the per-prompt figure is small and uncertain, and beer is a terrible way to offset anything.</p>
    </section>
  </main>

  <footer>
    <p>Beer Offset is not a registered offset program. Nothing is. Please also drink water.</p>
    <p><a href="https://github.com/" id="repo-link">Source</a></p>
  </footer>

  <div id="card" class="card" aria-hidden="true"></div>

  <script type="module" src="/src/main.ts"></script>
</body>
</html>
```

Note: `%VITE_SITE_URL%` is replaced by Vite at build time from the `VITE_SITE_URL` variable: the `.env` file from Task 1 locally, the Pages workflow env in Task 7. Vite leaves unknown placeholders as literal text, which is why `.env` must exist.

- [ ] **Step 2: Write stub modules so main.ts compiles before Tasks 4 and 5**

`src/glass.ts` (stub, replaced in Task 4):

```ts
import type { Mode } from './calc'

export type Glass = { update(level: number, mode: Mode): void }

export function createGlass(_canvas: HTMLCanvasElement): Glass {
  return { update() {} }
}
```

`src/share.ts` (stub, replaced in Task 5):

```ts
import type { Mode } from './calc'

export type ShareData = { tally: string; tokens: number; mode: Mode; stop: string }

export function setupShare(_button: HTMLButtonElement, _card: HTMLElement) {
  return { update(_data: ShareData) {} }
}
```

- [ ] **Step 3: Write src/main.ts**

```ts
import {
  BEER_PRESETS, STOPS, offset, nearestStop, trustFor, formatNumber, type Mode,
} from './calc'
import { createGlass } from './glass'
import { setupShare } from './share'

type State = { counts: Record<string, number>; trust: number; mode: Mode }

const GLASS_SCALE_ML = 2000
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
        <button type="button" data-delta="-1" aria-label="One fewer ${p.label.toLowerCase()}">&minus;</button>
        <output aria-live="off">0</output>
        <button type="button" data-delta="1" aria-label="One more ${p.label.toLowerCase()}">+</button>
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
    const pct = Math.max(0.5, (100 * r.ml) / max).toFixed(2)
    return `
      <div class="bar${r.you ? ' bar-you' : ''}">
        <span class="bar-label">${r.label}</span>
        <span class="bar-track"><span class="bar-fill" style="width:${pct}%"></span></span>
        <span class="bar-value">${formatNumber(r.ml / 1000)} L</span>
      </div>`
  }).join('')
}

const glass = createGlass($<HTMLCanvasElement>('glass'))
const share = setupShare($<HTMLButtonElement>('share'), $('card'))

function render() {
  const beers = BEER_PRESETS.map(p => ({ sizeMl: p.sizeMl, count: state.counts[p.id] }))
  const r = offset({ beers, trust: state.trust, mode: state.mode })
  const honest = state.mode === 'honest'
  const stop = nearestStop(state.trust)

  document.body.classList.toggle('honest', honest)

  for (const p of BEER_PRESETS) {
    $('presets').querySelector(`[data-id="${p.id}"] output`)!.textContent = String(state.counts[p.id])
  }

  $('trust-label').textContent = stop.exact ? stop.label : `somewhere near ${stop.label}`
  $('trust-ml').textContent = r.waterPerPromptMl.toPrecision(2)

  $('summary-naive').hidden = honest
  $('summary-honest').hidden = !honest

  $('hero-verb').textContent = honest ? 'You owe the GPUs' : 'You have offset'
  $('tokens').textContent = formatNumber(r.tokens)
  $('prompts').textContent = formatNumber(r.prompts)
  $('equivalents').innerHTML = r.equivalents
    .map(e => `<li><strong>${formatNumber(e.count)}</strong> ${e.label}</li>`)
    .join('')

  renderBars(r.waterDeltaMl)

  const level = (honest ? Math.abs(r.waterDeltaMl) : r.beerMl) / GLASS_SCALE_ML
  glass.update(Math.min(1, level), state.mode)

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
})
render()
```

- [ ] **Step 4: Write baseline src/styles.css**

This is scaffolding so the page is usable and the structure is visible. Impeccable replaces it in Task 6. Keep the custom property names; `glass.ts` reads `--beer`, `--foam`, `--debt`, `--glass-stroke`.

```css
:root {
  --bg: #f6f5f0;
  --ink: #1f2a24;
  --muted: #5d6b63;
  --green: #2f6b4f;
  --green-soft: #dfeee6;
  --rule: #d8d6cc;
  --beer: #e2a93b;
  --foam: #fff6e0;
  --debt: #b3261e;
  --glass-stroke: #2f3b35;
  --serif: Georgia, 'Times New Roman', serif;
  --sans: system-ui, sans-serif;
}

* { box-sizing: border-box; }
html { color-scheme: light; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--sans);
  line-height: 1.5;
}
h1, h2 { font-family: var(--serif); font-weight: 500; color: var(--green); }
h1 { font-size: 2.5rem; margin: 0; }
h2 { font-size: 1.5rem; margin: 0 0 .75rem; }
main, header, footer { max-width: 56rem; margin: 0 auto; padding: 1.5rem 1rem; }
section { padding: 2rem 0; border-top: 1px solid var(--rule); }

.masthead { position: relative; padding-top: 3rem; }
.subtitle { color: var(--muted); margin: .25rem 0 0; }
.badge {
  position: absolute; right: 1rem; top: 1.5rem;
  width: 6rem; height: 6rem; border-radius: 50%;
  border: 3px double var(--green); color: var(--green);
  display: grid; place-items: center; text-align: center;
  font-family: var(--serif); font-size: .8rem; line-height: 1.15;
}
.stamp {
  position: absolute; inset: 0; display: none; place-items: center;
  color: var(--debt); border: 4px solid var(--debt); border-radius: .25rem;
  font: 900 1.4rem var(--sans); letter-spacing: .1em; transform: rotate(-18deg);
}
body.honest .stamp { display: grid; }

.presets { display: grid; grid-template-columns: repeat(2, 1fr); gap: .75rem; }
@media (min-width: 40rem) { .presets { grid-template-columns: repeat(4, 1fr); } }
.preset {
  border: 1px solid var(--rule); border-radius: .5rem; padding: .75rem;
  display: grid; gap: .25rem; background: #fff;
}
.preset-name { font-weight: 600; }
.preset-size { color: var(--muted); font-size: .85rem; }
.stepper { display: flex; align-items: center; gap: .5rem; margin-top: .5rem; }
.stepper button {
  width: 2.25rem; height: 2.25rem; border-radius: 50%; border: 1px solid var(--green);
  background: var(--green-soft); color: var(--green); font-size: 1.1rem; cursor: pointer;
}
.stepper output { min-width: 1.5rem; text-align: center; font-variant-numeric: tabular-nums; }

.trust { margin-top: 1.5rem; }
.trust label { display: block; font-weight: 600; margin-bottom: .5rem; }
.trust input { width: 100%; }
.trust-ends { display: flex; justify-content: space-between; color: var(--muted); font-size: .85rem; }
.trust-readout { margin: .5rem 0 0; }

.hero { display: grid; gap: 1.5rem; align-items: center; }
@media (min-width: 40rem) { .hero { grid-template-columns: 300px 1fr; } }
.hero canvas { display: block; margin: 0 auto; }
.hero-verb { margin: 0; color: var(--muted); }
.hero-number { margin: 0; font: 500 3rem/1.1 var(--serif); font-variant-numeric: tabular-nums; }
body.honest .hero-number { color: var(--debt); }
.hero-sub { margin: .5rem 0 0; color: var(--muted); }
.equivalents { list-style: none; padding: 0; margin: .5rem 0 1rem; }
.share {
  padding: .6rem 1rem; border-radius: .4rem; border: 0;
  background: var(--green); color: #fff; font-size: 1rem; cursor: pointer;
}
.share:disabled { opacity: .6; cursor: progress; }

.bar { display: grid; grid-template-columns: 1fr; gap: .25rem; margin-bottom: .75rem; }
@media (min-width: 40rem) { .bar { grid-template-columns: 14rem 1fr 6rem; align-items: center; } }
.bar-track { display: block; height: .75rem; background: var(--green-soft); border-radius: .4rem; overflow: hidden; }
.bar-fill { display: block; height: 100%; background: var(--green); }
.bar-you .bar-fill { background: var(--beer); }
body.honest .bar-you .bar-fill { background: var(--debt); }
.bar-value { color: var(--muted); font-size: .9rem; font-variant-numeric: tabular-nums; }

.switch { display: inline-flex; align-items: center; gap: .75rem; cursor: pointer; }
.switch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.switch-track {
  width: 2.75rem; height: 1.5rem; border-radius: 1rem; background: var(--rule); position: relative;
}
.switch-track::after {
  content: ''; position: absolute; top: .15rem; left: .15rem; width: 1.2rem; height: 1.2rem;
  border-radius: 50%; background: #fff; transition: transform .2s;
}
.switch input:checked + .switch-track { background: var(--debt); }
.switch input:checked + .switch-track::after { transform: translateX(1.25rem); }
.switch input:focus-visible + .switch-track { outline: 2px solid var(--green); outline-offset: 2px; }
.switch-hint { color: var(--muted); font-size: .9rem; margin: .5rem 0 0; }

.methodology dt { font-weight: 600; margin-top: 1rem; }
.methodology dd { margin: .25rem 0 0; color: var(--muted); }

footer { color: var(--muted); font-size: .9rem; text-align: center; }

.card {
  position: fixed; left: -9999px; top: 0; width: 1200px; height: 630px;
  padding: 64px; background: var(--bg); color: var(--ink); font-family: var(--serif);
  display: flex; flex-direction: column; justify-content: center; gap: 12px;
}
.card-brand { margin: 0; color: var(--green); font-size: 32px; letter-spacing: .05em; text-transform: uppercase; }
.card-tally { margin: 0; font-size: 36px; color: var(--muted); }
.card-verb { margin: 0; font-size: 36px; }
.card-number { margin: 0; font-size: 110px; line-height: 1; font-variant-numeric: tabular-nums; }
body.honest .card-number { color: var(--debt); }
.card-source { margin: 0; font-size: 28px; color: var(--muted); }

@media (prefers-reduced-motion: reduce) {
  .switch-track::after { transition: none; }
}
```

- [ ] **Step 5: Type-check and build**

Run: `npm run build`
Expected: no TypeScript errors, `dist/` produced.

- [ ] **Step 6: Run in the browser pane and check behaviour**

Start the dev server with the `beer-offset` launch configuration (preview_start). Then:

1. Click "+" on Pint once. Expected: headline shows `577,000 tokens`, prompts `1,920`, equivalents `385 bug fixes`, `96 tabs vs spaces arguments`, `9.6 "rewrite it in Rust" proposals` (last one shows `10` because formatNumber rounds).
2. Drag the slider to the far right. Expected: readout "Using Doomer: 50 ml", headline `3,000 tokens`.
3. Toggle Full disclosure. Expected: body gets class `honest`, REVOKED stamp visible, verb "You owe the GPUs", headline red, summary paragraph swapped, your bar labelled "water consumed".
4. Toggle it back, set every count to 0. Expected: `0 tokens`, no `NaN` anywhere.
5. Tab through the page. Expected: steppers, slider, toggle, share button all reachable; toggle shows a focus ring.
6. Resize to 375px wide (mobile preset). Expected: no horizontal scroll, presets in two columns.

Fix anything that fails before committing.

- [ ] **Step 7: Commit**

```bash
git add index.html src/main.ts src/styles.css src/glass.ts src/share.ts
git commit -m "feat: build page structure, state and render"
```

---

### Task 4: Canvas glass hero

**Files:**
- Modify: `src/glass.ts` (replace the Task 3 stub entirely)

**Interfaces:**
- Consumes: `type Mode` from `src/calc.ts`; CSS custom properties `--beer`, `--foam`, `--debt`, `--glass-stroke` on the canvas's computed style.
- Produces: `createGlass(canvas: HTMLCanvasElement): Glass` with `Glass = { update(level: number, mode: Mode): void }`. `level` is 0 to 1; values outside are clamped. Same signature as the stub, so `main.ts` is untouched.

- [ ] **Step 1: Write src/glass.ts**

```ts
import type { Mode } from './calc'

export type Glass = { update(level: number, mode: Mode): void }

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
  canvas.style.width = `${W}px`
  canvas.style.height = `${H}px`
  ctx.scale(dpr, dpr)

  let colors = readColors()
  let mode: Mode = 'naive'
  let fromMode: Mode = 'naive'
  let from = 0
  let target = 0
  let animStart = 0
  let phase = 0
  let raf = 0

  function readColors() {
    const cs = getComputedStyle(canvas)
    const get = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback
    return {
      beer: get('--beer', '#e2a93b'),
      foam: get('--foam', '#fff6e0'),
      debt: get('--debt', '#b3261e'),
      stroke: get('--glass-stroke', '#2f3b35'),
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
      const surfaceY = BOTTOM - (BOTTOM - TOP) * liquid
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
      ctx!.fillStyle = colors.debt
      ctx!.fillRect(LEFT, DEBT_TOP, (RIGHT - LEFT) * debt, DEBT_H)
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
    update(level, m) {
      colors = readColors()
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
```

How the crossfade reads `from`: on a same-mode update, `from` is the level the bar currently shows and it eases to `target`. On a mode switch, `from` is the level the old mode's bar showed, so the old bar shrinks from there while the new bar grows from zero to `target`. A same-mode update that lands mid-crossfade makes the still-shrinking old bar vanish; that is a one-frame glitch and acceptable.

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: no errors. If TypeScript complains about `ctx` possibly null inside the inner functions, the `ctx!` assertions cover it; do not widen the type.

- [ ] **Step 3: Check in the browser pane**

With the dev server running:

1. Load the page. Expected: empty glass outline, no liquid, no animation loop (check with the console: `performance.now()` based loops are not visible, so just verify the CPU is idle, or temporarily add `console.count('draw')` and confirm it stops; remove the log afterwards).
2. Click "+" on Stein twice. Expected: liquid rises to the brim over about half a second, foam band on top, wave idles.
3. Click "+" on Stein five more times. Expected: glass stays full (level capped at 1), no overflow drawing outside the glass.
4. Toggle Full disclosure. Expected: liquid shrinks to nothing while the red debt bar under the glass grows to full width (2,000 ml of debt caps it).
5. Toggle it back. Expected: debt bar shrinks, liquid returns.
6. In the browser pane, emulate `prefers-reduced-motion: reduce` (Chrome DevTools rendering panel, or temporarily hardcode `reduced = true`). Reload, click "+" on Pint. Expected: liquid appears at its final level instantly, no wave motion, and the draw loop stops after one frame. Revert any hardcoding.

- [ ] **Step 4: Commit**

```bash
git add src/glass.ts
git commit -m "feat: draw animated beer glass on canvas"
```

---

### Task 5: Share card PNG export

**Files:**
- Modify: `src/share.ts` (replace the Task 3 stub entirely)

**Interfaces:**
- Consumes: `formatNumber` and `type Mode` from `src/calc.ts`; `html-to-image`'s `toPng`.
- Produces: `setupShare(button: HTMLButtonElement, card: HTMLElement): { update(data: ShareData): void }` with `ShareData = { tally: string; tokens: number; mode: Mode; stop: string }`. Same signature as the stub.

- [ ] **Step 1: Write src/share.ts**

```ts
import { toPng } from 'html-to-image'
import { formatNumber, type Mode } from './calc'

export type ShareData = { tally: string; tokens: number; mode: Mode; stop: string }

const FALLBACK = 'Export failed. Take a screenshot, we believe in you.'
const FILE_NAME = 'beer-offset.png'

export function setupShare(button: HTMLButtonElement, card: HTMLElement) {
  let data: ShareData = { tally: 'no beer at all', tokens: 0, mode: 'naive', stop: 'Google' }
  const idleLabel = button.textContent ?? 'Share your impact'

  function renderCard() {
    card.innerHTML = `
      <p class="card-brand">Beer Offset</p>
      <p class="card-tally">${data.tally}</p>
      <p class="card-verb">${data.mode === 'honest' ? 'I owe the GPUs' : 'I have offset'}</p>
      <p class="card-number">${formatNumber(data.tokens)} tokens</p>
      <p class="card-source">according to ${data.stop}</p>`
  }

  async function exportPng() {
    button.disabled = true
    button.textContent = 'Rendering…'
    try {
      const dataUrl = await toPng(card, { pixelRatio: 2, width: 1200, height: 630, cacheBust: true })
      const blob = await (await fetch(dataUrl)).blob()
      const file = new File([blob], FILE_NAME, { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Beer Offset' })
      } else {
        const a = document.createElement('a')
        a.href = dataUrl
        a.download = FILE_NAME
        a.click()
      }
      button.textContent = idleLabel
    } catch (err) {
      // User dismissed the native share sheet: not an error.
      if (err instanceof DOMException && err.name === 'AbortError') {
        button.textContent = idleLabel
        return
      }
      console.error('share export failed', err)
      button.textContent = FALLBACK
    } finally {
      button.disabled = false
    }
  }

  button.addEventListener('click', exportPng)
  renderCard()

  return {
    update(next: ShareData) {
      data = next
      renderCard()
    },
  }
}
```

`tally` and `stop` only ever come from the constants in `calc.ts`, and `tokens` goes through `formatNumber`, so the `innerHTML` here never carries user-typed text.

- [ ] **Step 2: Type-check**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Check in the browser pane (Review Focus item 4)**

1. Add 2 pints and 1 stein, click "Share your impact". Expected on desktop: a file `beer-offset.png` downloads (the browser pane may ask the user to allow the download; if it is declined, that is the environment, not a bug). Open it: 2400×1260 image reading "Beer Offset / 2 pints, 1 stein / I have offset / 2,310,000 tokens / according to Google". Button returns to "Share your impact".
2. Toggle Full disclosure, share again. Expected: "I owe the GPUs" and a red number.
3. Simulate failure: in the console run `document.getElementById('card').remove()` then click share. Expected: button reads the fallback text and is enabled. Reload afterwards.

- [ ] **Step 4: Commit**

```bash
git add src/share.ts
git commit -m "feat: export share card as png"
```

---

### Task 6: Impeccable design pass

**Files:**
- Create: `PRODUCT.md`, `DESIGN.md` (and any sidecar impeccable writes), `public/og.png`
- Modify: `src/styles.css` (replaced), `index.html` (markup refinements allowed; ids and copy rules from Global Constraints preserved), `src/glass.ts` (only the geometry and colour constants if the design needs it)

**Interfaces:**
- Consumes: the working page from Tasks 3 to 5, every DOM id listed in Task 3, and the CSS custom properties `--beer`, `--foam`, `--debt`, `--glass-stroke` read by `glass.ts`.
- Produces: the final visual world. No TypeScript interface changes.

This task is run by invoking the `impeccable` skill, not by hand-writing CSS. The brief below is what the skill needs; give it verbatim.

- [ ] **Step 1: Invoke impeccable init**

Invoke the Skill tool with `skill: impeccable`, `args: init`. Answer its questions from this brief:

> Product: Beer Offset, a single-page joke site. You enter beers drunk, it tells you how many AI tokens you have "offset" because the water you did not drink can cool GPUs. A "Full disclosure" toggle flips to honest math and you owe tokens instead. Audience: developers and AI-curious people who will screenshot the result and share it. Surface mode: Persuade. Visual world, pinned: a fake corporate ESG sustainability report that slowly breaks character top to bottom. Serif display headings, muted institutional green, generous whitespace, a round "Certified Offset Partner" badge that gets a rotated red REVOKED stamp in honest mode. Sections get progressively less corporate; the Methodology section is sincere and must stay readable and calm; the footer is fully unhinged. Must keep: every DOM id in index.html, native range input and checkbox, the canvas glass (reads `--beer`, `--foam`, `--debt`, `--glass-stroke`), the share card at 1200×630 positioned off-screen, mobile first with no horizontal scroll at 375px, `prefers-reduced-motion` respected. Fonts may be loaded from Google Fonts only. No new runtime dependencies.

- [ ] **Step 2: Invoke impeccable for the new surface**

Invoke the Skill tool with `skill: impeccable`, `args: shape index.html` and then follow its routing into new-work for the whole page. State explicitly: "The current styles.css is scaffolding, not an incumbent to preserve. Replace it. Markup ids, copy, and behaviour are fixed by the spec."

Let it write `DESIGN.md`, rewrite `src/styles.css`, and adjust markup classes. It will run one batched screenshot round (desktop and 375px mobile) and one fix round. Do not loop beyond that.

- [ ] **Step 3: Run the delight pass on the character break**

Invoke `impeccable` with `args: delight index.html`. Scope it to: the REVOKED stamp entrance, the hero number flipping to debt, and the copy drift between sections. Nothing structural.

- [ ] **Step 4: Verify nothing functional regressed**

Run: `npm test` and `npm run build`. Expected: both pass.

In the browser pane, repeat Task 3 Step 6 checks 1 to 6 and Task 4 Step 3 checks 2, 4, and 6. Expected: identical behaviour under the new styles.

- [ ] **Step 5: Produce public/og.png**

With the dev server running and zero beers entered, click "Share your impact" and save the downloaded `beer-offset.png` as `public/og.png`. If the browser pane cannot save downloads in this environment, ask the user to click Share once on the dev server and drop the file into `public/og.png`; do not block the rest of the task on it. If needed, temporarily set the card tally text to "Offset your prompts. One pint at a time." for this one export and revert.

- [ ] **Step 6: Commit**

```bash
git add PRODUCT.md DESIGN.md src/styles.css index.html public/og.png
git add -A  # picks up any impeccable sidecar files
git commit -m "feat: apply sustainability-report visual world"
```

---

### Task 7: GitHub Pages deploy and README

**Files:**
- Create: `.github/workflows/pages.yml`, `README.md`
- Modify: `index.html` (the `#repo-link` href)

**Interfaces:**
- Consumes: `BASE_PATH` from `vite.config.ts` (Task 1) and `%VITE_SITE_URL%` in `index.html` (Task 3).

- [ ] **Step 1: Write .github/workflows/pages.yml**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test
      - run: npm run build
        env:
          BASE_PATH: /${{ github.event.repository.name }}/
          VITE_SITE_URL: https://${{ github.repository_owner }}.github.io/${{ github.event.repository.name }}/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Write README.md**

```markdown
# Beer Offset

Offset your prompts. One pint at a time.

A joke page that converts beer drunk into AI tokens "offset", on the theory that
water you did not drink is free to cool GPUs. Toggle "Full disclosure" for the
honest math. Styled as a sustainability report that slowly loses its composure.

## Run

    npm install
    npm run dev

## Test and build

    npm test
    npm run build

## Deploy

Pushes to `main` deploy to GitHub Pages through `.github/workflows/pages.yml`.
In the repository settings, set Pages → Source to "GitHub Actions" once.

## Where the numbers come from

See the Methodology section on the page, or `docs/superpowers/specs/`.
```

- [ ] **Step 3: Point the footer link at the repo**

In `index.html`, set the `#repo-link` href to the real repository URL once it exists (the user creates the GitHub repository; ask for the URL if it is not known). Until then leave `https://github.com/`.

- [ ] **Step 4: Verify a production build with the base path**

Run:

```bash
BASE_PATH=/beer-offset/ VITE_SITE_URL=https://example.github.io/beer-offset/ npm run build && grep -o 'content="https://example.github.io/beer-offset/og.png"' dist/index.html
```

Expected: the grep prints the matched `og:image` content, and `dist/index.html` references assets under `/beer-offset/`.

- [ ] **Step 5: Commit**

```bash
git add .github/workflows/pages.yml README.md index.html
git commit -m "chore: add pages deploy workflow and readme"
```

- [ ] **Step 6: Push (only when the user has created the GitHub repository)**

```bash
git branch -M main
git remote add origin <repo-url>
git push -u origin main
```

Then tell the user to set Pages → Source to "GitHub Actions" in the repository settings and check the Actions tab for the first deploy.
