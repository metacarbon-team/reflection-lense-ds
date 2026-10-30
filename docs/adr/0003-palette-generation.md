# 0003. Palette generation and accessibility rules

- Status: Accepted
- Date: 2026-10-28
- Supersedes: —

## Context

Every theme — the Reflection brand and any custom theme created at runtime — is generated from seed colors ([0001](0001-token-architecture.md)). Seeds can be any hex, so accessibility cannot be checked after the fact and patched by hand: it has to hold by construction, for every input.

## Decision

### Inputs

- Seeds **per mode**: `bg`, `fg`, `accent` for light and for dark — six hex values per theme.
- Status colors (`success`, `warning`, `danger`, `info`) have **fixed hues** defined by the system; themes do not set them.

### Method: contrast-targeted generation in OKLCH

- Each semantic token is defined by a **target relation to a reference background** (a contrast ratio and/or a minimum lightness step), not by a fixed step of a ramp.
- Hue and chroma come from the seed in OKLCH. Lightness is **solved** (binary search) until the target is met; WCAG contrast depends on luminance only, so the search is cheap and exact.
- Colors outside sRGB are gamut-mapped as in CSS Color 4: chroma is reduced, lightness and hue are kept.
- Dark mode has its **own target table** and lower chroma on large areas; it is not an inversion of light mode.

### Seed fidelity

- **accent** stays as close to the seed as possible. The hue never changes. To make `on-emphasized` pass, the generator first tries a light and a dark `on-emphasized`; only if neither passes does it shift accent lightness, by the minimum needed.
- **bg** and **fg** may drift in lightness and chroma when contrast requires it.
- **Status hues** stay fixed and shift only when they conflict with a theme seed (e.g. a red accent close to `danger`), by the minimum needed.

### Weight of `emphasized`

The generator measures the contrast of `bg/accent/emphasized` against `surface` (the accent's **weight**) and aligns neutral and status `emphasized` fills to it, never below a minimum floor. The primary button is never outweighed by secondary solid fills because of a light brand color.

### Accessibility rules (WCAG 2.2 AA)

| Rule                  | Requirement                                                                                                                                                                                        |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Text                  | Every `fg` token (all roles and prominences, except `disabled`) ≥ 4.5:1 against every background it can appear on — all levels of the neutral stack (worst case) and its role's tinted backgrounds |
| On emphasized         | `fg/<role>/on-emphasized` ≥ 4.5:1 on `bg/<role>/emphasized` in default, `hover` and `pressed`                                                                                                      |
| Non-text              | `focus` ≥ 3:1 against the backgrounds it sits on. Only control boundaries must meet 3:1, and they use the highest-emphasis stroke `stroke/<role>/emphasized`; decorative dividers are exempt       |
| Disabled              | Exempt                                                                                                                                                                                             |
| Layer separation      | `surface → bg/neutral/subtle → bg/neutral` is monotonic in lightness with a minimum ΔL between neighbours                                                                                          |
| Prominence separation | Within each role, `bg` subtle / normal / emphasized and `fg` subtle / normal / emphasized keep a minimum ΔL between neighbours                                                                     |
| State separation      | `hover` differs from default and `pressed` from `hover` by a minimum ΔL                                                                                                                            |
| Translucent tokens    | `ghost`, `stroke`, `blanket` are validated worst-case: composited (normal alpha blending in sRGB) over every level of the stack                                                                    |
| Opacity classes       | Opaque scopes never carry alpha ([0002](0002-semantic-color-naming.md)); a violation fails the build                                                                                               |

Backgrounds and text are solved together, not one after another: text must pass on the deepest layer, which narrows the range left for fg prominence steps, especially in dark mode.

### Generation order (per mode)

1. `surface/neutral` from the `bg` seed.
2. Neutral stack `bg/neutral/subtle → bg/neutral` with minimum steps from `surface`.
3. `fg/neutral` subtle / normal / emphasized from the `fg` seed, passing on the worst background of the stack.
4. `bg/accent/emphasized` near the seed; choose `on-emphasized`; shift accent lightness only if needed; measure the accent weight.
5. Neutral and status `emphasized` aligned to the accent weight (not below the floor); status hues shifted only on conflict.
6. Tinted role backgrounds (`bg/<role>/subtle`, `bg/<role>`) and role foregrounds.
7. `hover` / `pressed` of every opaque fill by a lightness shift; `on-emphasized` re-checked in each state.
8. Translucent tokens: `stroke`, `ghost/*`, `blanket`.
9. Validation of every rule and an adjustment report.

### Never reject

The generator always returns a valid theme together with a report of what was shifted and by how much. A theme is never rejected, so runtime theming cannot fail; designers and products see where a seed could not be kept.

## Alternatives considered

- **Fixed-step ramps** (Tailwind, Radix): lightness fixed per step, only hue and chroma from the seed. Simple, but contrast breaks on unusual seeds — unacceptable for runtime themes from arbitrary hex.
- **HCT tones** (Material Color Utilities): contrast becomes tone arithmetic and the approach is proven at runtime on Android. Not chosen: its own color space and a recognisable Material look.
- **One seed set with derived dark mode** — rejected: seeds are set per mode.
- **Rejecting impossible seeds** — rejected: always shift instead.

## Consequences

- There is no classic `100…900` ramp in the contract. If illustrations or charts need one, it is generated separately.
- A high-contrast mode is a second target table, not a new system.
- The generator is the most critical piece of the system and must be covered by test vectors ([0001](0001-token-architecture.md)).

## Open questions

- Numeric thresholds: minimum ΔL for layers, prominences and states; the `emphasized` weight floor; the hue-conflict threshold. Calibrated in the internal Theme Lab (`apps/theme-lab`).
- Status hue values: chosen once the seeds of the default themes are provided; placeholders until then.
- Whether dark mode needs its own target table: the prototype applies one set of parameters to both modes; calibration decides.

## Revisions

- 2026-10-28 — resolved open question: only control boundaries must meet 3:1, using `stroke/<role>/emphasized`; decorative dividers are exempt.
- 2026-10-28 — thresholds are defined in an internal Theme Lab for theme generation and preview, not in Storybook. The prototype generator measures every lightness step on 8-bit colors as shipped, because rounding near black moves OKLCH lightness by several hundredths.
- 2026-10-28 — the `fg/neutral` ladder starts at the seed and the neutral `emphasized` fill has its own weight floor: see [0009](0009-neutral-strength.md). Disabled colors: see [0008](0008-disabled-role.md).
- 2026-10-28 — resolved open question: status roles have base colors (success `#51c35b`, danger `#f57042`, info `#4880ff`; warning still a placeholder). Their hue and chroma stay fixed, lightness is solved like any role, and the hue still shifts on conflict with the accent.
- 2026-10-28 — accent and status `emphasized` fills are kept exactly, on-emphasized text adapts instead, status hues no longer shift: see [0011](0011-exact-emphasized-colors.md).
- 2026-10-30 — the palette has ramps after all, derived from the tokens on one fitted grid per mode; tokens are still solved from relations. See [0013](0013-palette-ramps.md).
- 2026-10-30 — danger base color is `#f54242` (was the Tangerine swatch `#f57042`).
- 2026-10-30 — the background is the anchor and never drifts: text, layers and raised adapt to it. See [0015](0015-layer-direction.md).
- 2026-10-30 — warning base color is Tangerine `#f57042` from the brand's secondary palette; the default light background is Off White `#f8f6f0`.
