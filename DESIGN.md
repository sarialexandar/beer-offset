---
name: Beer Offset
description: A corporate sustainability report that loses its composure while its typography never does.
colors:
  field-green: "#0b3d2e"
  green-ink: "#0f4a38"
  green-2: "#1f6b50"
  green-tint: "#dcebe3"
  ground: "#f3f6f4"
  paper: "#ffffff"
  ink: "#16211c"
  ink-2: "#4b5c54"
  rule: "#c9d6cf"
  rule-strong: "#9fb5aa"
  on-field-2: "#b9d2c6"
  glass-stroke-on-field: "#e7efe9"
  beer: "#e2a93b"
  foam: "#fff6e0"
  report-red: "#b3261e"
  red-light: "#ff7a66"
  field-oxblood: "#3a0f0c"
  on-field-honest: "#fbeae6"
  on-field-2-honest: "#d9a39a"
typography:
  display:
    fontFamily: "'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', serif"
    fontSize: "clamp(3rem, 2rem + 6vw, 6rem)"
    fontWeight: 400
    lineHeight: 0.95
    letterSpacing: "-0.01em"
  figure:
    fontFamily: "'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', serif"
    fontSize: "clamp(3rem, 2rem + 5vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.01em"
    fontFeature: "tnum"
  headline:
    fontFamily: "'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', serif"
    fontSize: "clamp(1.5rem, 1.2rem + 1.4vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  pull:
    fontFamily: "'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', serif"
    fontSize: "clamp(1.6rem, 1.2rem + 1.8vw, 2.4rem)"
    fontWeight: 400
    lineHeight: 1.15
  lede:
    fontFamily: "'Source Serif 4', 'Iowan Old Style', 'Palatino Linotype', serif"
    fontSize: "1.2rem"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  label:
    fontFamily: "'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.55
  caption:
    fontFamily: "'Archivo', 'Helvetica Neue', Arial, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.55
rounded:
  control: "2px"
  stamp: "3px"
  pill: "1rem"
  round: "50%"
spacing:
  gutter: "1.25rem"
  wrap: "64rem"
  row: "0.7rem"
  note: "1.5rem"
  section-top: "3rem"
  section-bottom: "2.5rem"
components:
  button-share:
    backgroundColor: "{colors.ground}"
    textColor: "{colors.field-green}"
    typography: "{typography.label}"
    rounded: "{rounded.control}"
    padding: "0.8rem 1.25rem"
  button-share-hover:
    backgroundColor: "{colors.field-green}"
    textColor: "{colors.ground}"
  button-stepper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.field-green}"
    rounded: "{rounded.control}"
    size: "2.25rem"
  button-stepper-hover:
    backgroundColor: "{colors.field-green}"
    textColor: "{colors.ground}"
  auditor-note:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.field-green}"
    padding: "1.5rem"
    width: "44rem"
  switch-track:
    backgroundColor: "{colors.rule-strong}"
    rounded: "{rounded.pill}"
    width: "3rem"
    height: "1.6rem"
  switch-track-on:
    backgroundColor: "{colors.report-red}"
  revoked-stamp:
    backgroundColor: "{colors.field-oxblood}"
    textColor: "{colors.red-light}"
    rounded: "{rounded.stamp}"
  bar-track:
    backgroundColor: "{colors.green-tint}"
    height: "0.9rem"
  bar-fill:
    backgroundColor: "{colors.green-2}"
  bar-fill-you:
    backgroundColor: "{colors.beer}"
  bar-fill-you-honest:
    backgroundColor: "{colors.report-red}"
  share-card:
    backgroundColor: "{colors.field-green}"
    textColor: "{colors.ground}"
    padding: "72px 80px"
    width: "1200px"
    height: "630px"
---

# Design System: Beer Offset

## Overview

**Creative North Star: "The Annual Report That Cracks"**

Beer Offset is set and paced like a real corporate ESG annual report: a full-bleed cover band, numbered sections, Table and Figure captions, footnote marks, hairline rules, a boxed auditor's note and a colophon. The joke lives entirely in the copy, which loses composure section by section; the typography, rules and grid never do. Every visual decision serves that straight face. If a surface looks like a landing page (centred hero, big-number cards, gradient), it has left the world.

Density is that of a printed report: one column of measured text (68ch) on a cool green-tinted ground, broken by two deep fields (the cover band and the results panel) that carry the institutional colour. Ornament is limited to what a report actually prints: rules, a rosette seal, a canvas figure, a rubber stamp. Motion is held still like paper, with one authored moment when honesty arrives.

Honest mode is a world state, not a theme: toggling Full disclosure repaints both fields from institutional green to oxblood, stamps REVOKED across the rosette, turns the reader's own bar red and drains the glass into a debt bar. This repaint is a deliberate decision ruled on by the user and is part of the system.

**Key Characteristics:**
- Two-field structure: deep coloured fields (cover, results, share card) against a light report ground.
- Serif for anything a reader would quote or a report would print as a figure; grotesk for tables, controls, captions and footnotes.
- Hairline rules (1px) separate rows; a 2px rule in field green opens each table, figure and the auditor's note.
- Tabular numerals globally.
- Nearly square corners (2px) on every control.
- One authored motion moment (the REVOKED slam); everything else is still or a quiet state transition.

## Colors

An institutional green report with one warm accent for beer and one alarm red for the truth.

### Primary
- **Institutional Green** (field-green): the field colour of the cover band, results panel and share card; also section headings, pull lines, table-opening rules, stepper strokes and the auditor's note text on the ground. It is the report's voice.
- **Ledger Green** (green-2): bar-chart fills for reference rows and the focus ring colour (2px outline, 3px offset).
- **Link Green** (green-ink): text links on the ground only.
- **Pale Ledger Tint** (green-tint): empty bar tracks.

### Secondary
- **Beer Amber** (beer) with **Foam** (foam): used only where beer is literally depicted: the canvas glass liquid and foam, the "Your beer" bar in naive mode, the favicon drop.

### Tertiary
- **Report Red** (report-red): honest-mode only, on the light ground: the honest summary text, the "Your beer" bar and label, the switch track when on, the honest hint.
- **Red on Field** (red-light): the same red raised for dark fields: the REVOKED stamp and the canvas debt bar inside the results panel.
- **Oxblood Field** (field-oxblood) with **Blush** (on-field-honest) and **Faded Blush** (on-field-2-honest): honest mode repaints both fields to oxblood and swaps the on-field text pair. Recorded as a deliberate user decision.

### Neutral
- **Report Ground** (ground): page background, never cream; also primary text on the green field.
- **Paper** (paper): raised report surfaces (auditor's note, colophon band, stepper buttons, slider thumb, switch knob).
- **Ink** (ink) and **Ink Secondary** (ink-2): body text and captions, sizes, footnotes, tick labels on the ground.
- **Field Secondary** (on-field-2): meta lines, units, verbs and footnotes on the green field.
- **Hairline** (rule) and **Strong Hairline** (rule-strong): row dividers; the strong one closes tables, tracks the slider and boxes the note.
- **Glass Stroke** (glass-stroke-on-field): the canvas glass outline when drawn on a field.

### Named Rules
**The Literal Amber Rule.** Beer amber appears only where beer is depicted. It is never a button, link, highlight or decoration.

**The Red Means Disclosure Rule.** Red appears only in honest mode and on the REVOKED stamp. Use report-red on light surfaces and red-light on any field; never the reverse.

**The Field Token Rule.** Anything on a field reads `--field`, `--on-field` and `--on-field-2`, never a literal green, so honest mode repaints it for free. The canvas glass and share card follow the same tokens.

## Typography

**Display Font:** Source Serif 4 (with Iowan Old Style, Palatino Linotype, serif)
**Body Font:** Archivo (with Helvetica Neue, Arial, sans-serif)

**Character:** An annual-report serif that prints the figures and the quotable lines, paired with a sober grotesk that runs the tables and controls. Italic serif is where the copy drifts (subtitle, pull line, verbs, units, auditor's note, colophon line).

### Hierarchy
- **Display** (400, clamp 3rem to 6rem, 0.95): the cover title only.
- **Figure** (400, clamp 3rem to 5.5rem, 1): the hero token count; the share card sets it at 120px.
- **Headline** (400, clamp 1.5rem to 2rem, 1.15): numbered section headings ("1. Executive summary"), field green on the ground, on-field inside a field.
- **Pull** (400 italic, clamp 1.6rem to 2.4rem, 1.15): the executive-summary pull line, under a 2px green rule.
- **Lede** (400, 1.2rem, 1.45): the Methodology opening, max 60ch.
- **Body** (Archivo 400, 1rem, 1.55): paragraphs at max 68ch.
- **Label** (Archivo 500 to 600, 1rem): preset names, control labels, definition terms, the share button.
- **Caption** (Archivo 400, 0.85rem): Table and Figure captions, report meta, colophon meta. Slider ticks go to 0.72rem.

### Named Rules
**The Figures Are Serif Rule.** Any number a report would print as a result (hero count, stepper count, bar values, equivalents) is set in Source Serif 4 at weight 400 with tabular numerals.

**The Italic Drift Rule.** Italic serif carries the voice; roman serif carries the facts. Never italicise a control or a table cell.

## Layout

A single 64rem column with 1.25rem gutters. Sections on the ground take 3rem top and 2.5rem bottom padding and are separated by a hairline; the last one drops it. Fields run full bleed with their content held to the same column.

The cover band is a two-column grid: meta, title, subtitle and tagline stack left, the rosette badge (clamp 6.5rem to 9rem) holds the right column across all rows. The results panel stacks heading, glass and text on mobile and becomes heading over a 300px glass column plus text from 48rem. The executive summary splits 1fr / 1.4fr from 48rem; Methodology turns into a 15rem term column from 48rem; Figure 2 rows go label / track / value from 40rem. Mobile first; nothing scrolls horizontally at 375px.

## Elevation & Depth

Flat. Depth comes from the two-field structure and from paper-white surfaces lifted against the tinted ground with a hairline box, not from shadows.

### Shadow Vocabulary
- **Control knob** (`box-shadow: 0 2px 6px -1px rgba(11, 61, 46, .35)`): the range slider thumb only.
- **Switch knob** (`box-shadow: 0 1px 3px rgba(0, 0, 0, .3)`): the toggle knob only.

### Named Rules
**The Printed Page Rule.** Surfaces never cast shadows; only the two draggable knobs do, because they are physical controls.

## Shapes

Rectilinear and nearly square. Controls and buttons take a 2px corner, the REVOKED stamp 3px with a 3px border, rotated -14°. The only curves are functional: the pill switch track, the round slider thumb and switch knob, and the circular rosette (two concentric rings, text on a circular path, a drop-and-sprig mark). Tables, figures and the note open with a 2px field-green top rule.

## Components

### Buttons
Quiet, report-grade, square.
- **Shape:** 2px corner, 1px border.
- **Share (primary, on field):** filled with the on-field colour, field-coloured text, Archivo 500, 0.8rem by 1.25rem padding. Hover inverts to transparent with on-field text. Disabled drops to 0.6 opacity while rendering.
- **Stepper:** 2.25rem square, paper fill, green 1px border and green SVG minus or plus (1.5 stroke, round caps). Hover fills green; active nudges down 1px.
- **Focus:** global 2px green-2 outline with 3px offset.

### Inputs / Fields
- **Trust slider:** native range, 2px track (green progress, strong hairline remainder), 1.25rem paper thumb with a 2px green border and the knob shadow. Labelled tick marks hang below on 1px hairlines; the second tick drops a row to avoid collision, and alternating ticks hide under 30rem.
- **Full disclosure switch:** native checkbox behind a 3rem by 1.6rem pill track; strong hairline off, report red on; knob slides 1.4rem with the ease-out curve.

### Tables and Figures
Table 1 (consumption disclosure) is rows of name / size / stepper on hairlines between a 2px green top rule and a strong-hairline bottom. Figure 2 is a comparative bar chart: 0.9rem tracks in pale tint, ledger-green fills scaled by transform, the reader's row in beer amber (report red in honest mode), serif values right-aligned. Every table and figure carries a numbered caption ("Table 1.", "Figure 2.") in caption type.

### Cover Band and Rosette Badge
The cover band is the first field. The rosette is an inline SVG in currentColor reading "CERTIFIED OFFSET PARTNER · 2026" on a circular path. In honest mode the rosette dims to 0.45 opacity and the REVOKED stamp (Archivo 700, 0.12em tracking, red-light on the field) appears across it.

### Results Panel and Glass
The second field. A canvas pint glass (300 by 420) reads `--beer`, `--foam`, `--debt`, `--glass-stroke`, `--on-field-2`, `--field` and `--sans` from the cascade; the panel overrides `--glass-stroke` and `--debt` for the dark ground. Naive mode fills amber with a foam band; honest mode crossfades to an empty glass and a red debt bar labelled "N L owed". Equivalents list on rgba white hairlines; serif figures with sans labels.

### Auditor's Note
A paper box with a strong hairline and a 2px green top rule, 1.5rem padding, max 44rem. Italic serif note in green, then the switch, then a hint line in ink-2 (report red once applied).

### Colophon
Paper band with a top hairline: caption-size meta, an italic serif closing line in green at clamp 1.2rem to 1.6rem, max 40ch.

### Share Card
A 1200 by 630 off-screen field rendered to PNG: rosette top-right (with stamp in honest mode), serif brand 34px, italic tally, verb 40px, number 120px, sans source line 24px in on-field-2. It inherits the honest-mode field.

### Motion
- **REVOKED slam:** stamp scales 1.7 to 1 and rotates -22° to -14° from blurred and transparent, while the badge jolts 1px; 0.5s, `cubic-bezier(0.16, 1, 0.3, 1)`. Deferred until the badge is 40% in view.
- **Glass crossfade:** 600ms cubic ease-out between fill and debt bar, also deferred until in view; a slow idle wave moves the liquid surface while beer is shown.
- **State transitions:** fields cross-fade background colour over 0.6s; bar fills scale over 0.6s; button colours over 0.15s.
- All of it, including the idle wave, is off under `prefers-reduced-motion`.

## Do's and Don'ts

### Do:
- **Do** set every printed result in Source Serif 4, weight 400, tabular numerals.
- **Do** number sections ("4. Comparative impact") and caption every table and figure ("Figure 2. ...").
- **Do** open tables, figures and boxed notes with a 2px field-green rule and divide rows with 1px hairlines.
- **Do** colour anything on a field through `--field`, `--on-field` and `--on-field-2` so honest mode repaints it.
- **Do** repaint both fields oxblood in honest mode; this is a recorded user decision.
- **Do** keep controls native (range, checkbox) and square-cornered (2px).

### Don't:
- **Don't** use beer amber anywhere beer is not depicted.
- **Don't** use red before Full disclosure is on, except the stamp itself.
- **Don't** add shadows to surfaces; only the slider thumb and switch knob carry one.
- **Don't** use a cream or warm page ground; the ground is cool green-tinted white.
- **Don't** add motion beyond the slam and the glass; the report is otherwise still.
- **Don't** reuse the cover's report-meta line as a small label above section headings; headings carry their own number.
