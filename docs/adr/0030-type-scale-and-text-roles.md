# 0030. Tailwind v4 type scale and text roles with viewport modes

- Status: Accepted
- Date: 2026-11-05
- Supersedes: in [0006](0006-typography.md), the size primitives named by px, the modular scale with a ratio per mode, the 12px minimum and the removal of link styles; the leading rule of [0028](0028-calibrated-leading.md) and the line-height rounding of [0018](0018-nearest-line-height-grid.md); the per-viewport type primitives in the DTCG export of [0022](0022-dtcg-export.md) and [0023](0023-all-modes-export.md)
- Extends: [0029](0029-tailwind-v4-dimensions-in-rem.md)

## Context

Dimension tokens follow Tailwind v4 ([0029](0029-tailwind-v4-dimensions-in-rem.md)); the type scale did not. The generator built a modular scale from a base and a ratio per viewport, named small sizes by px and computed line heights from multipliers. The Figma library had its own sizes (18, 22, 28, 36, 52), component styles (`button/*`) and variables named by role that held raw numbers.

## Decision

### Primitives

One scale for every viewport, in rem (1rem = 16px). Names and values follow Tailwind's `--text-*`, extended with `2xs` and `sm`; `md` takes Tailwind's `sm`.

| Step   | Size             | Line height    |
| ------ | ---------------- | -------------- |
| `2xs`  | 0.625rem (10px)  | 1rem (16px)    |
| `xs`   | 0.75rem (12px)   | 1rem (16px)    |
| `sm`   | 0.8125rem (13px) | 1.25rem (20px) |
| `md`   | 0.875rem (14px)  | 1.25rem (20px) |
| `base` | 1rem (16px)      | 1.5rem (24px)  |
| `lg`   | 1.125rem (18px)  | 1.75rem (28px) |
| `xl`   | 1.25rem (20px)   | 1.75rem (28px) |
| `2xl`  | 1.5rem (24px)    | 2rem (32px)    |
| `3xl`  | 1.875rem (30px)  | 2.25rem (36px) |
| `4xl`  | 2.25rem (36px)   | 2.5rem (40px)  |
| `5xl`  | 3rem (48px)      | 3rem (48px)    |
| `6xl`  | 3.75rem (60px)   | 3.75rem (60px) |

- Tokens: `font/size/<step>` and `font/line-height/<step>`. Line height belongs to the step, as in Tailwind; no multipliers.
- The minimum text size is 10px (`2xs`).
- The Theme Lab edits the steps in rem, with px shown only as the Figma value. Sizes must grow strictly, stay at or above 0.625rem and be whole px (0.0625rem steps); line heights must be at least the size and sit on a 0.25rem (4px) grid.

### Text roles

Composite styles keep the grammar of [0006](0006-typography.md), `role / [size] / [weight]`, plus a `link` role. Each role takes a step per viewport:

| Role            | Family | Weights                   | Desktop | Mobile |
| --------------- | ------ | ------------------------- | ------- | ------ |
| `display/large` | serif  | 300                       | `5xl`   | `4xl`  |
| `display`       | serif  | 300                       | `4xl`   | `3xl`  |
| `heading/large` | serif  | 400                       | `3xl`   | `2xl`  |
| `heading`       | serif  | 400                       | `2xl`   | `xl`   |
| `heading/small` | serif  | 400                       | `lg`    | `lg`   |
| `body/large`    | sans   | 400, `medium`, `semibold` | `lg`    | `base` |
| `body`          | sans   | 400, `medium`, `semibold` | `base`  | `base` |
| `body/small`    | sans   | 400, `medium`, `semibold` | `md`    | `md`   |
| `body/xsmall`   | sans   | 400, `medium`, `semibold` | `sm`    | `sm`   |
| `label/large`   | sans   | 500                       | `base`  | `base` |
| `label`         | sans   | 500                       | `md`    | `md`   |
| `label/small`   | sans   | 500                       | `xs`    | `xs`   |
| `link`          | sans   | 500, underlined           | `base`  | `base` |
| `link/small`    | sans   | 500, underlined           | `md`    | `md`   |
| `code`          | mono   | 400, `bold`               | `md`    | `md`   |
| `code/small`    | mono   | 400, `bold`               | `xs`    | `xs`   |
| `caption`       | sans   | 400                       | `xs`    | `xs`   |
| `caption/small` | sans   | 400                       | `2xs`   | `2xs`  |
| `overline`      | sans   | 600, uppercase            | `xs`    | `xs`   |

- `button/*` is removed: buttons use `label/large` and `label`.
- `caption/small` (10px) no longer collides with `caption` (12px), which settles that question of 0006.
- Weights and tracking keep their current values. Numeric weight primitives and em tracking stay open in 0006.

### Figma

- Primitives live in a collection with a single mode.
- Every role has `<role>/font-size` and `<role>/line-height` in the Typography collection, with Desktop and Mobile modes; each aliases the role's step in that mode.
- Styles bind to their role's variables. A style change in a mode is a change of the role's alias, never of a style or a primitive.

### Export

- DTCG: the primitives once, and a `typography` composite per style and viewport (`typography/desktop/…`, `typography/mobile/…`) that references them: `fontSize: "{font.size.md}"`. DTCG's `lineHeight` is a number, so it holds the ratio, and the step's line-height reference is kept in `$extensions`. Underline and uppercase go in `$extensions` too, since DTCG has no fields for them.
- The Theme Lab edits the role table as well: steps per viewport and weights.

## Alternatives considered

- **Keep the modular scale** — no Tailwind step names, and its `lg` (20px) is Tailwind's `xl`.
- **Line height from multipliers** (0028) — one step would need two line heights (`lg` for body and headings); Tailwind's per-step values remove that.
- **Primitives with viewport modes** — names would mean different sizes on mobile (`lg` ≠ 18px).
- **Responsive styles at the point of use, Tailwind style** (`text-2xl md:text-3xl`) — every component would decide its own mobile sizes; roles keep that decision in the system.
- **Shifting Tailwind's `sm` back to 14px and naming 13px by its value** — keeps Tailwind parity for one name but leaves an odd numeric step among t-shirt sizes.

## Consequences

- Visual change in components is limited to the Dialog title (`heading/small`, line height 26 → 28px). Headings and display change mainly on documentation pages.
- Components keep their style references: styles are renamed, not replaced. Layers using `button/*` move to `label/*`.
- DTCG type tokens are renamed, and consumers of `font/desktop` / `font/mobile` move to `font/*` and `typography/*`.
