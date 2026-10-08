---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface: index.html (the whole single page)

Scope: the entire Beer Offset page. Visitor mode: Persuade (the visitor must enter beers, read the result, flip Full disclosure, and share).

Audience and job: developers and AI-curious people arriving from a share; they want a screenshot-worthy number in under two minutes and, if curious, the sincere Methodology.

Action: add beers, drag the trust slider, press "Download impact statement". Proof: the cited constants in Methodology; the honest-mode flip.

Constraints: all DOM ids fixed by the spec; native range input and checkbox; canvas glass reads --beer, --foam, --debt, --glass-stroke; share card 1200×630 off-screen; mobile first, no horizontal scroll at 375px; reduced motion respected; Google Fonts only; no new runtime deps; Methodology stays sincere; footer copy fixed.

## Direction contract

THESIS: The page is a corporate ESG sustainability report, set and paced like a real annual report (cover band, numbered figures, footnoted tables, auditor's note, colophon), whose copy loses composure section by section while its typography never does. It refuses the category default (centred headline, big number, three cards) and the taproom/chalkboard rendition.

OWN-WORLD: Deep institutional green (#0b3d2e) as a field that owns the cover band and the results panel; cool green-tinted white (#f3f6f4) page ground, never cream; hairline rules (1px #c9d6cf); one warm accent, beer amber (#e2a93b), used only where beer is literally depicted; report red (#b3261e) reserved for honest mode and the REVOKED stamp. Type: Source Serif 4 for display and figures (annual-report serif, italics for the drift), Archivo for body, tables, controls, footnotes; tabular numerals everywhere a figure appears. Components speak report: "Table 1", "Figure 3", superscript footnote marks, a circular rosette badge with text on a path, a boxed auditor's note, a colophon.

STORY: The visitor reads a plausible sustainability report, enters their beers as a "consumption disclosure", watches a glass fill inside the results panel and a token figure appear, then finds the Full disclosure switch in the auditor's note. Flipping it stamps REVOKED on the cover, drains the glass into a debt bar, and the headline becomes "You owe the GPUs". They understand the per-prompt number is disputed, laugh, and download the impact statement to post.

FIRST VIEWPORT: Full-bleed deep green cover band: top-left small report meta ("Fiscal year 2026 · Scopes 1, 2 and Pint"), the rosette badge top-right; "Beer Offset" as a serif title scaling from 3rem to 6rem, subtitle beneath; below the band on the page ground, the numbered Executive summary in two columns (pull-line left, body right) and the start of Table 1 (the consumption disclosure with steppers) visible at desktop. Primary action is the stepper row itself; the share button lives in the results panel one scroll down.

FORM: Brief-pinned by the user in brainstorming ("fake sustainability report that breaks character"); concept-seed not run, no seed key. Signature interaction: the REVOKED stamp slam on Full disclosure (scale 1.6→1 with a −14° rotate, exponential ease-out), paired with the glass crossfade to a debt bar; motion grammar is otherwise still, as a printed report.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
