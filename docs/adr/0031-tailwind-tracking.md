# 0031. Tracking on Tailwind v4 steps

- Status: Accepted
- Date: 2026-11-05
- Supersedes: the tracking values kept by [0030](0030-type-scale-and-text-roles.md) and the em tracking question of [0006](0006-typography.md)

## Context

[0030](0030-type-scale-and-text-roles.md) moved sizes and line heights to Tailwind v4 but kept tracking as px values per role (`tracking/hero`, `tracking/display`, `tracking/heading`, `tracking/wide`, `tracking/caps`). Tailwind defines tracking in em, so it scales with the font size. Figma variables cannot hold em: a letter-spacing variable bound to a style always resolves in px.

## Decision

### Primitives

`font/tracking/<step>` in em, Tailwind's `--tracking-*`: `tighter` −0.05, `tight` −0.025, `normal` 0, `wide` 0.025, `wider` 0.05, `widest` 0.1.

### Roles

Each text role takes one tracking step for every viewport:

| Role                       | Step     |
| -------------------------- | -------- |
| `display/large`, `display` | `tight`  |
| `heading/large`, `heading` | `tight`  |
| `overline`                 | `wider`  |
| `caption/small`            | `wide`   |
| every other role           | `normal` |

Display and heading take `tight` rather than `normal` to keep their current negative tracking.

### Figma

The chain is one step shorter than for size and line height, because em becomes px only against a font size: every role has `<role>/letter-spacing` in the Typography collection, a px value per mode (step × the role's size in that mode) written by the generator. Styles bind to it. The `tracking/*` variables are removed.

### Export

DTCG has no em dimension. Primitives are `number` tokens (`font/tracking/tight` = −0.025); a composite's `letterSpacing` is the resolved rem value, and the step's reference is kept in `$extensions` next to the line height.

## Consequences

- Desktop tracking changes slightly: `display/large` −1 → −1.2px, `display` −0.4 → −0.9px, headings −0.3 → −0.75 / −0.6px, `overline` 0.7 → 0.6px, `caption/small` 0.2 → 0.25px. Components use none of these styles except `overline` (Contextual Menu).
- Tracking now follows the font size: a role's mobile size changes its tracking with it.
