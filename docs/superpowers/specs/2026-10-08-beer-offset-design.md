# Beer Offset — Design Spec

Date: 2026-10-08
Status: approved in brainstorming, pending written review

## 1. Purpose

A single-page joke site. You enter how much beer you drank, and it tells you how many
AI tokens you "offset", on the premise that water you did not drink is water free to
cool GPUs. The page is styled as a corporate sustainability report that slowly breaks
character, and a "Full disclosure" toggle flips the math to the honest version: brewing
beer uses far more water than it contains, so you actually owe the GPUs.

Success: someone screenshots their result, posts it, and a friend asks how the math
works. The methodology section then teaches them that nobody agrees on the number.

Phase 2 (later, out of scope for this spec): users feed in their real AI usage and the
page runs the math backwards, telling them how many beers they have "earned".

## 2. Scope

Phase 1 in scope:
- Static site, no backend, no accounts, no analytics.
- Beer input, trust slider, naive and honest modes, animated glass, share card,
  methodology section with real sources.
- Deployed to GitHub Pages.

Out of scope:
- Any server, leaderboard, persistence beyond the current page load.
- Phase 2 import of usage data (only the calc entry point is reserved, see §5).
- Imperial units. Everything is metric; sources are in ml.

## 3. Calculation model (`src/calc.ts`)

Pure module. No DOM, no imports from the rest of the app.

### 3.1 Constants

| Name | Value | Note |
|---|---|---|
| `WATER_PER_PROMPT_STOPS` | Google 0.26, Altman 0.32, UCR onsite 2.2, viral 2023 25, UCR full 50 (ml) | Labelled stops on the trust slider, see sources in §7 |
| `TOKENS_PER_PROMPT` | 300 | Stated assumption, shown in methodology |
| `BREWERY_RATIO` | 5 | Litres of water per litre of beer, brewery only |
| `FULL_FOOTPRINT_RATIO` | 150 | Footnote punchline only, not used in the calculation |
| `BEER_PRESETS` | can 330, pint 500, imperial pint 568, stein 1000 (ml) | |
| `EQUIVALENTS` | bug fix 5 prompts, tabs-vs-spaces argument 20 prompts, "rewrite it in Rust" 200 prompts | |

### 3.2 Trust slider mapping

`trust` is a number in `[0, 1]`. `waterPerPrompt(trust)` interpolates on a log scale
between 0.26 ml (trust = 0, "Google") and 50 ml (trust = 1, "Doomer"):

```
ml = 0.26 * (50 / 0.26) ** trust
```

The UI snaps a label when `ml` is within 10% of a stop. The function itself does not
snap.

### 3.3 Inputs and outputs

```ts
type Beer = { sizeMl: number; count: number }
type Mode = 'naive' | 'honest'
type Input = { beers: Beer[]; trust: number; mode: Mode }

type Result = {
  beerMl: number            // total volume drunk
  waterPerPromptMl: number  // from trust
  waterDeltaMl: number      // naive: +beerMl; honest: beerMl - beerMl * BREWERY_RATIO (negative)
  prompts: number           // waterDeltaMl / waterPerPromptMl, sign carries mode
  tokens: number            // prompts * TOKENS_PER_PROMPT
  equivalents: { label: string; count: number }[]
}

export function offset(input: Input): Result
```

Rules:
- Counts and sizes are clamped to `>= 0`. `trust` is clamped to `[0, 1]`.
- `prompts` and `tokens` are returned unrounded. Rounding is a display concern.
- Honest mode: `waterDeltaMl = beerMl - beerMl * BREWERY_RATIO`, so it is negative
  whenever `beerMl > 0`. `prompts` is therefore negative and the UI reads it as "owed".
- `equivalents` uses `Math.abs(prompts)` divided by each equivalent's prompt cost.

### 3.4 Phase 2 entry point (reserved, implemented, unused by the UI)

```ts
export function fromTokens(tokens: number, trust: number): { beerMl: number; pints: number }
```

Runs the math backwards: tokens → prompts → water → beer volume "earned" under the
naive premise. Phase 1 ships it with a test and no UI.

## 4. Page structure (`index.html`, `src/main.ts`, `src/styles.css`)

Single page, eight sections in order. Each section is one notch less corporate than
the one before. The visual world is a fake ESG sustainability report: serif headings,
muted green palette, generous whitespace, a round "Certified Offset Partner" badge.
Impeccable owns the concrete tokens, type, and layout; it writes PRODUCT.md and
DESIGN.md. This spec only fixes content, order, and behaviour.

1. **Masthead.** Title "Beer Offset", subtitle "2026 Sustainability Impact Report",
   certified badge.
2. **Executive summary.** One paragraph of straight-faced ESG language.
3. **Contribution form.** Four preset cards (can, pint, imperial pint, stein), each with
   a count stepper (minus, number, plus). Below them the trust slider, labelled
   "Methodology confidence", left end "Google", right end "Doomer", with the stop labels
   from §3.1 shown as ticks. Every change recomputes instantly.
4. **Hero.** The glass (§5), the headline token number, and three equivalents.
   Naive copy: "You have offset N tokens." Honest copy: "You owe the GPUs N tokens."
5. **Impact breakdown.** Small horizontal bar chart comparing the user's water delta to
   fixed reference bars: a 5 minute shower (65,000 ml), a burger (~2,400,000 ml), an
   almond (3,560 ml). Straight-faced labels.
6. **Full disclosure toggle.** A switch. When on, mode becomes honest: the badge gets a
   rotated red "REVOKED" stamp, the glass drains (§5), hero copy flips, and the
   executive summary is replaced by a one-line admission.
7. **Methodology.** Sincere. Lists every constant with its source (§7), explains that
   estimates differ by over 100x, says what is and is not counted. This section does
   not joke.
8. **Footer.** Fully unhinged: "Beer Offset is not a registered offset program.
   Nothing is. Please also drink water." Plus a link to the repo.

Interaction rules:
- State is `{ beers, trust, mode }` held in `main.ts`. One `render(state)` function
  reads `offset(state)` and updates the DOM. No framework.
- Numbers are formatted with `Intl.NumberFormat` and shown with at most three
  significant figures above 1,000.
- All controls are keyboard operable and have labels. The slider is a native
  `<input type="range">`. The toggle is a native checkbox styled as a switch.
- Mobile first. Preset cards wrap to two columns at phone width. No horizontal scroll.

## 5. Glass hero (`src/glass.ts`)

Canvas 2D, one `<canvas>` sized to its container with devicePixelRatio handling.

- Draws a pint-glass outline, a liquid body, a sine-wave surface, and a foam band.
- Fill level is `min(beerMl / 2000, 1)` in naive mode. The level animates with an
  ease-out over ~600 ms on every change using `requestAnimationFrame`; the wave idles
  with a slow phase loop while visible.
- Honest mode: the liquid drains to zero, then a red "debt" bar grows below the glass
  base, proportional to `|waterDeltaMl|` capped at the same 2,000 ml scale.
- `prefers-reduced-motion`: no idle wave, level changes jump to the final frame.
- Public API: `createGlass(canvas) -> { update(level: number, mode: Mode): void }`.
- ponytail: canvas 2D, upgrade to a WebGL shader only if the overdrive pass wants
  refraction or bubbles.

## 6. Share card (`src/share.ts`)

- A hidden fixed-size card element (1200×630) containing: "Beer Offset", the beer
  tally in words ("3 pints, 1 stein"), the headline number and verb (offset / owe),
  and "according to {nearest stop label}".
- "Share your impact" button renders it to PNG with `html-to-image`. On devices where
  `navigator.canShare` accepts files, use the Web Share API; otherwise trigger a
  download named `beer-offset.png`.
- On any export error, replace the button text with "Export failed. Take a screenshot,
  we believe in you."
- Static OG image and `<meta>` tags in `index.html` so pasted links preview.

## 7. Sources for the constants

Shown verbatim in the methodology section.

- Google, median Gemini text prompt, 0.26 ml, Aug 2025 technical report (via
  DatacenterDynamics coverage).
- Sam Altman, ~0.000085 gallons ≈ 0.32 ml per ChatGPT query, OpenAI blog, 2025.
- Shaolei Ren / UC Riverside: ~2.2 ml onsite per request for an average US data
  centre; ~50 ml when water used to generate electricity is included.
- 2023 "a bottle per 10 to 50 responses" modelled estimate (Li, Ren et al., GPT-3
  scenario), the origin of the viral figure; ~25 ml is the midpoint.
- Brewery water ratio: 3 to 10 litres per litre of beer at the brewery (Grundfos,
  MIT Sloan, Asahi); 60 to 300 litres per litre including crop irrigation
  (WWF/SABMiller). The spec uses 5 and 150.
- Reference bars: shower 65 litres (Claude "drip" skill figure), burger ~2,400 litres
  (common beef water-footprint figure, flagged as approximate), almond 3.56 litres
  (2019 California study).

The methodology section states that all per-prompt figures are modelled, not metered,
and that the 300 tokens per prompt assumption is ours.

## 8. Files

```
index.html
src/main.ts        state + render
src/calc.ts        pure math (§3)
src/calc.test.ts   vitest
src/glass.ts       canvas hero (§5)
src/share.ts       PNG export (§6)
src/styles.css     impeccable-owned tokens and layout
public/og.png      static share preview
PRODUCT.md         written by impeccable init
DESIGN.md          written by impeccable
.github/workflows/pages.yml
package.json, tsconfig.json, vite.config.ts
```

Dependencies: `vite`, `typescript`, `vitest` (dev); `html-to-image` (runtime). Nothing
else without a reason stated in the plan.

## 9. Testing

- `calc.test.ts`: slider endpoints map to 0.26 and 50 ml; midpoint is geometric
  (≈3.6 ml); naive mode with one 500 ml pint at trust 0 yields ≈1,923 prompts; honest
  mode with the same input yields a negative value of ≈ −7,692 prompts; zero beers
  yields zero everything; `fromTokens` inverts `offset` for a known input; negative
  inputs are clamped.
- Everything visual is checked by impeccable's one batched screenshot round, desktop
  and phone, light and dark if DESIGN.md defines dark.
- `npm run build` must pass with zero TypeScript errors before deploy.

## 10. Deploy

GitHub Pages from a single Actions workflow: on push to `main`, install, test, build,
upload `dist/`. Vite `base` set to the repo name.

## 11. Error handling

No network at runtime, so the failure surface is: invalid or absurd input (clamped,
and sizes over 10 litres are allowed, the copy can enjoy it), canvas unsupported
(hide the glass, keep the number), and share export failing (§6 fallback).

## 12. Phase 2 note

Phase 2 adds an "Import usage" panel that produces a token count and calls
`fromTokens`. Candidate inputs: pasted Claude Code cost output, a usage JSON export, or
a local hook. Nothing in phase 1 should depend on where tokens come from; `offset` and
`fromTokens` are the only contract.
