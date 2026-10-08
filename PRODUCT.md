# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Vite + TypeScript, no framework, static output deployed to GitHub Pages. Decided by the user in the design spec (`docs/superpowers/specs/2026-10-08-beer-offset-design.md`).

## Users

Developers and AI-curious people who have heard "AI uses a bottle of water per prompt". They arrive from a shared link or screenshot, spend under two minutes, and want a result worth posting. Secondary: the friend who asks "wait, how does the math work?" and reads the Methodology section.

## Product Purpose

Beer Offset is a single-page joke calculator. You enter beer drunk, it tells you how many AI tokens you have "offset", on the premise that water you did not drink is free to cool GPUs. A "Full disclosure" toggle flips to honest math (brewing uses about five litres of water per litre of beer) and you owe the GPUs instead. Success: someone screenshots their result, shares it, and a friend ends up reading the sincere Methodology section and learns that per-prompt water estimates differ by more than a hundred times.

## Positioning

A parody of corporate carbon-offset programs applied to AI water use, with real, cited numbers underneath. The "whose numbers do you trust" slider (Google's 0.26 ml to a 50 ml worst case) is the mechanism: the joke is built from the actual disagreement, so it is funny and quietly educational at once.

## Operating Context

Opened on a phone from a social post or on a laptop while arguing about AI water use. One page, no sign-in, no persistence. The share card (1200×630 PNG) is the main artifact that leaves the page.

## Capabilities and Constraints

- Inputs: four beer presets (can 330 ml, pint 500, imperial pint 568, stein 1000) with count steppers; a trust slider (native range input); a Full disclosure toggle (native checkbox).
- Outputs: tokens, prompts, three playful equivalents, a reference bar chart, an animated canvas glass that fills (naive) or shows a debt bar (honest), and a shareable PNG.
- All math lives in `src/calc.ts` and is unit-tested; metric only.
- No backend, no analytics, no runtime network calls, no new runtime dependencies beyond `html-to-image`.
- Fonts may load from Google Fonts only.
- `prefers-reduced-motion` must disable the idle wave and animations.
- Mobile first; no horizontal scroll at 375 px.
- Phase 2 (undecided in detail): import real AI usage (token counts) and run the math backwards via `fromTokens`. Phase 1 must not depend on where tokens come from.

## Brand Commitments

- Name: Beer Offset. Subtitle: "2026 Sustainability Impact Report".
- Binding visual constraint volunteered by the user: a fake corporate ESG sustainability report that slowly breaks character top to bottom; the badge "Certified Offset Partner" gets a red REVOKED stamp in honest mode. The Methodology section stays sincere. Footer copy is fixed: "Beer Offset is not a registered offset program. Nothing is. Please also drink water."
- Voice: straight-faced ESG language that erodes section by section into honesty.

## Evidence on Hand

- Sources for every constant are in the Methodology section of `index.html` and in the spec: Google's Aug 2025 Gemini report (0.26 ml), Altman's 0.32 ml, UC Riverside 2.2 ml onsite and ~50 ml including power-plant water, the 2023 "bottle per 10–50 responses" estimate, brewery water ratios (Grundfos, MIT Sloan, Asahi, WWF/SABMiller).
- No testimonials, customers, partners, or certifications exist. The "Certified Offset Partner" badge is the joke, not a claim; nothing may be presented as a real program.

## Product Principles

1. The joke is the real disagreement: never invent a number; every figure is cited.
2. Break character gradually, then be sincere where it matters (Methodology).
3. The share card is the product: the result must be screenshot-worthy by itself.
4. Phone first, one hand, under two minutes.
5. Nothing beyond the page: no accounts, no tracking, no backend.

## Accessibility & Inclusion

Native controls with visible labels, keyboard operable, visible focus, reduced-motion respected. No formal standard was set; treat WCAG 2.2 AA as the floor.
