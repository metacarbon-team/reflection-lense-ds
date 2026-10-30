# 0013. Palette ramps on a fitted grid

- Status: Accepted
- Date: 2026-10-30
- Supersedes: "there is no classic `100…900` ramp in the contract" in [0003](0003-palette-generation.md); how semantic tokens are solved is unchanged

## Context

The Figma library has a Palette collection under the semantic Theme variables, and designers expect ramps they can browse and reuse. [0003](0003-palette-generation.md) solves every semantic token from relations (contrast, lightness steps). It rejected fixed-step ramps as the source of colors, because contrast breaks on unusual seeds.

Two ways to derive ramps from the solved tokens were compared in the Theme Lab:

- **Token ramps**: every token color is a step, and the gaps are filled. Exact, but the number of steps varies, and step `300` means a different lightness in every family.
- **Fixed steps, snapped**: one even lightness grid, with tokens snapped to the nearest step. Layers and states are 0.03 apart while the grid is about 0.07 apart, so layers merged, the paper turned white, seeds moved, and 106 rules failed in light mode.

## Decision

Ramps are **derived from the tokens**, never the other way round. Every family has the **same steps on one fitted lightness grid** per mode, and tokens stay exact.

### Families

A token's family is where its hue comes from:

- `neutral`: the background seed's tone (surface and neutral layers);
- `foreground`: the text seed's tone (text, neutral solid fill, on-emphasized text, disabled, neutral strokes, blanket);
- `accent`, `success`, `warning`, `danger`, `info`.

### Steps

- 15 steps, `100` (white) to `800` (black), by 50. A family with more distinct colors than steps gets more steps, in every family of that mode.
- Each family places its token colors on grid steps by dynamic programming: in order, each on the nearest step, at the smallest squared lightness distance.
- Steps between two token colors follow the grid's shape between them. They are interpolated in OKLCH, and achromatic endpoints take the family's hue.
- **The grid** is the average of the families' lightness at each step, repeated until it settles. Where tokens sit close together (layers and states 0.03 apart), the grid is dense; elsewhere it is sparse.
- `drift` is the largest distance of a family's step from the grid. It shows how far the family bends to keep its tokens exact. With the default seeds it stays below 0.16; across random seeds it reaches about 0.28.

### Bindings

Every semantic token aliases one step of its family. Translucent tokens alias the step plus their exact opacity. Resolving every token through its binding gives the generated theme back unchanged, so every rule of [0003](0003-palette-generation.md) still holds.

## Alternatives considered

- **Token ramps** — rejected: step numbers mean different lightness in different families, and the step count varies.
- **An even fixed grid with tokens snapped to it** (Tailwind, Radix) — rejected: it breaks layers, states, contrast and exact seeds.
- **A parametric curve (for example a cubic Bézier) fitted to the tokens** — not needed: the averaged grid fits better and is monotonic by construction.

## Consequences

- The grid is per mode, so the Palette is mode-dependent: `neutral/300` in light is not the same color as `neutral/300` in dark.
- Ramps change when seeds or generator parameters change. Steps are generated, like every other color ([0004](0004-figma-sync.md)).
- Step numbers are comparable across families only approximately, within the family's drift.
- Fill steps (no token on them) exist for browsing and illustrations. Components bind semantic tokens, not steps.

## Open questions

- Whether 15 steps are enough once more roles exist.

## Revisions

- 2026-10-30 — resolved open question: in Figma the Palette is one collection without modes, with two equal branches, `reflection/light/<family>/<step>` and `reflection/dark/<family>/<step>`. Theme switches the mode and Core routes each mode to its branch, so Palette modes would be redundant.
