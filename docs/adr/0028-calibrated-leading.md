# 0028. Leading calibrated to the Figma library

- Status: Accepted
- Date: 2026-11-05
- Supersedes: the default body leading of [0018](0018-nearest-line-height-grid.md) (1.25). The rounding rule of 0018 and the heading leading stay.

## Context

[0018](0018-nearest-line-height-grid.md) set the default leading to 1.25 for body and headings. Compared with the Figma library (Design System Scaffolder, Typography collection), that default shrinks almost every line of UI text by 4px:

| Size | Figma line height | 1.25 on the 4px grid | Δ   |
| ---- | ----------------- | -------------------- | --- |
| 13   | 20                | 16                   | −4  |
| 14   | 20                | 16                   | −4  |
| 16   | 24                | 20                   | −4  |

Components use almost only these sizes. Across the component pages (06–31), text styles are 12–16px (`button/*`, `body/small`, `body/compact`, `label/*`, `caption`). The only heading is `heading/small`, used twice in Dialog. `body/large` and `display` are unused. Many components hug their content (155 button variants, Item, Tabs, Select, Toast, Inline Alert, Tooltip, Popover, Card), so a 4px shorter line would make each of them 4px shorter per line of text. 14px at a 16px line is a leading of 1.14, too tight for reading text.

Figma itself follows no multiplier: from 16px up, line height is the font size + 8px in both modes. That puts `heading/small` (26) and `heading/medium` (30) off the 4px grid.

## Decision

- Default leading: **body 1.45**, **heading 1.25**.
- Line height is still `fontSize × leading` rounded to the nearest multiple of 4px, with ties rounding up ([0018](0018-nearest-line-height-grid.md)).
- Font sizes, the modular scale and the assignment of heading leading by step stay unchanged; both leading controls remain adjustable in the Theme Lab.

Applied to the current Figma sizes:

| Style                              | Figma, Desktop / Mobile | Calibrated, Desktop / Mobile | Δ       |
| ---------------------------------- | ----------------------- | ---------------------------- | ------- |
| `caption/micro` 10, `caption` 12   | 16                      | 16                           | 0       |
| `body/compact` 13, `body/small` 14 | 20                      | 20                           | 0       |
| `body/default` 16                  | 24                      | 24                           | 0       |
| `body/large` 18 / 16               | 28 / 24                 | 28 / 24                      | 0       |
| `heading/small` 18                 | 26                      | 24                           | −2      |
| `heading/medium` 22 / 20           | 30 / 28                 | 28 / 24                      | −2 / −4 |
| `heading/large` 28 / 24            | 36 / 32                 | 36 / 32                      | 0       |
| `display` 36 / 32                  | 44 / 40                 | 44 / 40                      | 0       |
| `display/hero` 52 / 40             | 60 / 48                 | 64 / 52                      | +4      |

## Alternatives considered

- **Keep 1.25 for body** — every 13, 14 and 16px line loses 4px; hugging components get shorter and dense text becomes hard to read.
- **Body 1.4** — matches up to 16px, but `body/large` (18px) drops from 28 to 24.
- **Body 1.5** — 12px gives 18, a tie that rounds up to 20: `caption` and `label/small`, the most used styles after buttons and body, grow by 4px.
- **Font size + 8px** (Figma's rule) — keeps headings exact but leaves the 4px grid, or, snapped to it, grows `caption` and `body/small` by 4px.
- **Heading 1.3** — `display` grows by 4px and `display/hero` by 8px on desktop.

## Consequences

- Body text in Figma components keeps its line heights; component heights do not change.
- Only headings move: `heading/small` and `heading/medium` shrink by 2–4px onto the 4px grid, `display/hero` grows by 4px. Their only use in components is the Dialog title.
- Generated defaults: `12`, `13`, `14` and `base` get 16, 20, 20 and 24 in both modes.
- The size scale itself is a separate decision: the Figma sizes above 16px (18, 22, 28, 36, 52) still do not follow the generator's modular scale.

## Open questions

- Whether Figma's heading sizes or the generator's modular ratio become the reference for sizes above base.
- Heading leading is assigned by step (`xl` and up) in the generator but by role in Figma, where `heading/small` (18px) sits below `xl`. Composite text styles must settle which rule wins.
