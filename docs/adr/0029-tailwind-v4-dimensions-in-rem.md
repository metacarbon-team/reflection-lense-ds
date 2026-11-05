# 0029. Dimension tokens follow Tailwind v4, in rem

- Status: Accepted
- Date: 2026-11-05
- Supersedes: the spacing list of [0005](0005-dimension-scales.md) (it was read as Tailwind v3's fixed set) and the px units of typography dimensions in [0022](0022-dtcg-export.md)
- Implements: [0021](0021-dimension-token-exports.md)

## Context

The Figma library (Design System Scaffolder, collection Number value) holds spacing, sizes, radii and border widths. Its numbers are Tailwind v4's rem values recalculated to px at 16px: `spacing/4` 16 is `1rem`, `radius/md` 6 is `0.375rem`, `size/md` 448 is `28rem`. It also had pieces no ADR described:

- `size/0 … size/96`, aliases of `spacing/*` with the `WIDTH_HEIGHT` scope. Figma scopes keep `spacing` (`GAP`) out of width and height pickers, so the same steps are repeated for sizing, mirroring Tailwind's `size-*`, `w-*` and `h-*` utilities.
- `spacing/4-5` (18px), outside the list in 0005 and without code syntax.
- `border/width/0, 1, 2, 4`.
- `ring/width/thin` (0.5) and `ring/width/regular` (1), bound only to example tiles on the Effects documentation page. The focus ring ([0025](0025-focus-ring.md)) uses literal values.

The Theme Lab will be the source of truth for most consumers, so its DTCG export should carry the units the web uses.

## Decision

### Reference

Tailwind CSS **v4** is the only reference. Values are borrowed, Tailwind is not a dependency ([0005](0005-dimension-scales.md)).

### Spacing

- `spacing/<n>` is `n × 0.25rem` (4px). Steps are multiples of 0.5; `spacing/px` is 1px.
- The list is explicit, because Figma and native platforms cannot compute steps on the fly: `0`, `px`, `0.5`, `1`, `1.5`, `2`, `2.5`, `3`, `3.5`, `4`, `4.5`, `5`, `6`, `7`, `8`, `9`, `10`, `11`, `12`, `14`, `16`, `20`, `24`, `28`, `32`, `36`, `40`, `44`, `48`, `52`, `56`, `60`, `64`, `72`, `80`, `96`.
- A new step is added to this list explicitly, with its Figma code syntax. `4.5` is the first such step.
- A decimal point is written as a dash in names: `spacing/0-5`, `--spacing-0-5`.

### Size

- `size/<n>` exists for every spacing step and equals it: it is the sizing mirror of the spacing scale. CSS writes it as an alias, `--size-4: var(--spacing-4)`, so Figma's code syntax resolves.
- Container sizes keep the names of 0005: `size/3xs` (16rem) … `size/7xl` (80rem), Tailwind's `--container-*` values.

### Radius and border width

- Radius as in 0005: `none`, `xs` 0.125rem … `4xl` 2rem, `full` 9999px.
- `border/width/0, 1, 2, 4` follow Tailwind's `border-*` utilities, in px.

### Ring width

Ring width is not a token, as in Tailwind, where `ring-<n>` is a literal width. `ring/width/*` is removed from Figma. The focus ring keeps the literal 1px ring and 4px halo of [0025](0025-focus-ring.md) in the `focus/ring` effect style.

### Units

- **1rem = 16px**, fixed.
- DTCG and CSS use **rem** for spacing, size, radius and typography (`font/size/*`, `font/line-height/*`).
- **px** stays where Tailwind uses px: `spacing/px`, `border/width/*`, `radius/full` and shadow geometry.
- Figma variables hold px, so the Figma sync multiplies rem by 16. Native adapters do the same and map px to pt and dp ([0005](0005-dimension-scales.md)).

## Alternatives considered

- **px in DTCG** — matches Figma, but every web consumer would convert, and text would not scale with spacing when the user changes the browser text size.
- **Tailwind v3's fixed spacing list** — v4 accepts any multiple of 0.25rem; the list exists only because Figma and native need explicit values.
- **Ring width tokens** — not a Tailwind concept; the focus ring is defined once and does not need them.
- **Binding the focus ring to `border/width/*`** — a halo is a shadow spread, not a border, and the border scope would leak into effect pickers.

## Consequences

- `@reflection/tokens` exports the spacing, size, radius and border-width scales, their DTCG tokens and CSS custom properties.
- The Theme Lab export includes them; in the all-modes document they are shared groups, like font families.
- Typography dimensions in DTCG change from px to rem. Consumers that read them as px must convert.
- Figma gains `size/4-5`, the size mirror of the new spacing step; `ring/width/*` is removed.
