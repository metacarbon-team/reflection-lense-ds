# 0014. Lightness steps measured with screen flare

- Status: Accepted
- Date: 2026-10-30
- Supersedes: plain OKLCH lightness as the axis of every ΔL rule in [0003](0003-palette-generation.md), [0007](0007-raised-background.md) and [0008](0008-disabled-role.md); the step sizes stay

## Context

Every ΔL rule (layers, states, raised, disabled, ghost, text prominence) is measured in OKLCH lightness. OKLab models ideal viewing, but a real display never shows pure black and reflects ambient light. Near black that flare swamps small differences. On a pure black background the neutral layers came out `#010101 → #040404 → #090909`: the same 0.03 steps as on light paper, but a contrast of 1.02 and 1.05 against the surface, against 1.09 and 1.20 in the light theme. Raised could not be seen at all, since nothing is darker than black.

## Decision

- Every ΔL rule is measured on **screen lightness**: OKLab lightness after adding a flare `f` to the color in linear light, `(c + f) / (1 + f)` per channel.
- `flare` is a generator parameter, **0.005** (half a percent of white) by default; 0 gives plain OKLCH lightness. The validator measures with the same parameter, so it stays independent of the generator but agrees with it.
- Step sizes (`layerStep`, `stateStep`, `raisedStep`, …) keep their values. Near black the same step now needs a larger change in color, and near white almost nothing changes.
- Contrast rules (WCAG) are unchanged. Searches that start from a color's OKLCH lightness still use OKLCH lightness.

## Consequences

| Background                | Layers (surface → subtle → bg) | Contrast to surface |
| ------------------------- | ------------------------------ | ------------------- |
| `#000000`, before         | `#010101 → #040404 → #090909`  | 1.02, 1.05          |
| `#000000`, flare 0.005    | `#070707 → #121212 → #1c1c1c`  | 1.08, 1.18          |
| `#1a1b1a` (dark default)  | `#1a1b1a → #232423 → #2c2d2c`  | 1.11, 1.25          |
| `#faf8f3` (light default) | `#faf8f3 → #efede8 → #e5e3de`  | 1.10, 1.21          |

- A pure black background moves up to `#070707`: raised needs room below it ([0007](0007-raised-background.md)), and that room is now measured as it looks.
- Dark themes get slightly larger steps; light themes change by a unit or less per channel.

## Alternatives considered

- **A minimum background lightness for dark themes** — rejected: the background is the anchor, and a designer may want pure black.
- **Minimum WCAG contrast between layers** — rejected: it would add a second metric for the same rule; flare keeps one axis.
- **APCA** — not adopted for text; the flare term borrows its soft clamp near black for ΔL only.

## Open questions

- Calibration of `flare` in the Theme Lab against real displays (OLED in a dark room vs. LCD in daylight).
