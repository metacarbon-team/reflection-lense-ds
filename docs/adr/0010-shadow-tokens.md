# 0010. Shadow tokens

- Status: Accepted
- Date: 2026-10-28
- Supersedes: —

## Context

Elevation needs shared shadows on every platform and in Figma. [0002](0002-semantic-color-naming.md) left their naming open. The Figma library has four single-layer effect styles (`Agent Harness/Shadow/*`) and 17 shadow color variables, but no ramp; the Mirror concept uses two-layer shadows (a tight contact shadow plus a soft ambient one) that read much smoother. A shadow ramp generator with Tailwind level names is tuned in the Theme Lab.

## Decision

### A scale, not semantic names

Shadows are a **scale**, like spacing: `shadow/2xs`, `shadow/xs`, `shadow/sm`, `shadow/md`, `shadow/lg`, `shadow/xl`, `shadow/2xl`. Components pick a level; there are no semantic aliases (`shadow/popover`, `shadow/card`) for now.

### Layers

| Level      | Layers                                                        |
| ---------- | ------------------------------------------------------------- |
| `2xs`      | `contact` only: a crisp 1px line under the element, no blur   |
| `xs`–`2xl` | `contact` (tight, close to the edge) + `ambient` (soft, wide) |

Edges are never part of a shadow: boundaries come from `stroke` tokens.

### Tokens

- **Composite** — `shadow/<level>`, DTCG type `shadow` with a list of layers. CSS: `--shadow-<level>`.
- **Layer colors** — `shadow/<level>/<layer>`, translucent colors, for Figma and for platforms that build shadows from parts.

Geometry (offset, blur, spread) is the same in both modes. Colors differ per mode:

- hue and chroma come from the mode's `surface/neutral` (`tint` = 0 gives black), lightness at most half the surface's, so a shadow never glows on dark surfaces;
- opacity is multiplied by `darkAlphaScale` in dark mode.

The ramp is generated from the parameters tuned in the Theme Lab (offset range, blur and spread ratios, opacity range and curve, contact layer, hairline opacity, tint, dark multiplier); the parameters are the source of truth.

### Figma

- Layer colors are variables in the Theme collection, with the Light and Dark modes, so shadows switch with the mode.
- Each level is an effect style `shadow/<level>`; its layer colors are bound to those variables, geometry is written into the style.
- The `Agent Harness/Shadow/*` styles and the old `shadow/*` color variables are hidden and marked deprecated ([0004](0004-figma-sync.md)). Focus ring styles are not shadows and are out of scope.

## Alternatives considered

- **Semantic shadow names** (`shadow/popover`, `shadow/dialog`) — postponed: no components yet to justify them.
- **Single-layer shadows** (the current Figma styles) — rejected: they read flat or blurry; two layers are smoother.
- **Rings inside shadows** — rejected: edges belong to `stroke`.
- **Geometry as Figma variables** — rejected: it does not change between modes, so variables add nothing.

## Consequences

- Every elevated element picks one level and, if it needs an edge, a `stroke` token.
- Platforms without layered shadows (some native APIs) use the `ambient` layer alone, or `contact` for `2xs`.

## Open questions

- Semantic aliases once components exist.
- Calibration of the dark-mode multiplier with real dark seeds.
