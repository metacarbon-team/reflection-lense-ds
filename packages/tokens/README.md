# @reflection/tokens

The theme generator. Pure TypeScript with no runtime dependencies. It turns three seed colors per mode into the semantic color tokens, validates them, and exports them as DTCG. Dimension and type-scale data live here too, as static tables.

Theme Lab tunes the parameters and exports the result. `@reflection/theme` builds the committed export into CSS. Nothing at runtime imports this package. It is the reference implementation to port when another platform needs to generate themes itself.

## API

| Export                                                                                                                      | What it does                                                                                                 |
| --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `generateTheme(seeds, params?)`                                                                                             | Both modes: `{ light, dark }`, each a `ModeTheme`                                                            |
| `generateMode(mode, seeds, params?)`                                                                                        | One mode: `{ mode, tokens, adjustments }`. `tokens` maps a name to `{ name, value: '#rrggbb[aa]', opacity }` |
| `validateMode(theme, params?)`                                                                                              | Every broken rule as `{ rule, token, against?, actual, required }`. Empty means the mode passes              |
| `toDtcg(modeTheme, options?)`                                                                                               | One mode and viewport as a DTCG 2025.10 document                                                             |
| `toDtcgAllModes(theme, options?)`                                                                                           | Both modes in one document, as committed in `packages/theme/tokens/reflection.tokens.json`                   |
| `toCssVars(modeTheme)`                                                                                                      | `{ '--bg-accent-emphasized': '#cee04b', … }` for one mode                                                    |
| `cssVarName(name)`                                                                                                          | `bg/accent/emphasized/hover` → `--bg-accent-emphasized-hover`                                                |
| `generateRolePalette(modeTheme)`                                                                                            | Palette ramps per family, and the step every token binds to                                                  |
| `generateShadows(params?)`, `generateModeShadows(modeTheme, params?)`, `shadowCss`                                          | Shadow geometry, and the layer colors per mode                                                               |
| `dimensionTokens()`, `SPACING_STEPS`, `CONTAINER_SIZES`, `RADII`, `BORDER_WIDTHS`, `REM_BASE`, `toPx`, `dimensionCssVars()` | Dimension scales (static)                                                                                    |
| `DEFAULT_TYPE_SCALE`, `textStyles`, `validateTypeScale`, `FONT_WEIGHTS`, `VIEWPORTS`                                        | Type scale and text roles (static, editable in Theme Lab)                                                    |
| `contrast`, `composite`, `hexToRgba`, `rgbaToHex`, `rgbToOklch`, `oklchToRgb`, `lightness`                                  | Color math                                                                                                   |
| `DEFAULT_SEEDS`, `DEFAULT_PARAMS`, `DEFAULT_SHADOWS`                                                                        | Defaults                                                                                                     |
| `generateFixedPalette`, `generateCurvePalette`, `familyCurve`, `BRAND_SHAPES`, `params.curve`                               | Prototypes. The shipped output does not use them                                                             |

## Inputs

### Seeds

Each mode takes three seeds. The background is kept exactly. Text and accent are kept whenever the rules allow it.

| Seed     | Light     | Dark      |
| -------- | --------- | --------- |
| `bg`     | `#f8f6f0` | `#1a1b1a` |
| `fg`     | `#1a1b1a` | `#f8f6f0` |
| `accent` | `#cee04b` | `#cee04b` |

The status base colors are a generator parameter, not seeds, and are the same in both modes: success `#51c35b`, warning `#f57042`, danger `#f54242`, info `#4880ff`. Each keeps its hue and chroma. Its lightness is solved like any other role's.

### `GeneratorParams`

The defaults are placeholders until they are calibrated in Theme Lab. Every lightness step (ΔL) is measured on screen lightness (see [Color math](#color-math)).

| Param                | Default                          | Meaning                                                                                   |
| -------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| `flare`              | `0.005`                          | Share of white added in linear light before every ΔL is measured. `0` gives plain OKLCH L |
| `layerStep`          | `0.03`                           | Minimum ΔL between neighbouring layers, and between a tint and `bg/<role>`                |
| `stateStep`          | `0.03`                           | Minimum ΔL from a fill to its hover, and from hover to pressed. Ghost hover takes 2× this |
| `formStep`           | `0.02`                           | Minimum ΔL by which `form/neutral` moves every neutral layer                              |
| `disabledStep`       | `0.02`                           | Minimum ΔL by which `bg/disabled` moves every neutral layer                               |
| `fgStep`             | `0.08`                           | Minimum ΔL between `fg/<role>/subtle` and `fg/<role>`                                     |
| `roleTextStep`       | `0.12`                           | ΔL from the 4.5:1 floor to `fg/<role>` for every role except neutral                      |
| `textContrast`       | `4.5`                            | WCAG contrast for text                                                                    |
| `nonTextContrast`    | `3`                              | WCAG contrast for focus and `stroke/<role>/emphasized`                                    |
| `neutralWeightFloor` | `12`                             | Minimum contrast of `bg/neutral/emphasized` against `surface`                             |
| `disabledContrast`   | `2`                              | Minimum contrast of `fg/disabled`, which must also stay below `textContrast`              |
| `tintChroma`         | `0.03`                           | OKLCH chroma of every tinted role background                                              |
| `statusSeeds`        | see above                        | Status base colors                                                                        |
| `strokeAlpha`        | `{ subtle: 0.08, normal: 0.16 }` | Alpha of `stroke/<role>/subtle` and `stroke/<role>`. `stroke/disabled` uses `subtle`      |
| `backdropAlpha`      | `0.48`                           | Alpha of `surface/backdrop` (black)                                                       |
| `focusHaloAlpha`     | `0.25`                           | Alpha of `focus/accent/subtle`                                                            |
| `curve`              | `null`                           | Prototype: takes chroma and hue from a family curve instead                               |

The generator adds a `0.05` margin to every contrast target, so that 8-bit rounding never drops a color below the target. The validator checks the targets themselves, without the margin.

## Token set (per mode)

| Scope     | Tokens                                                                                                                                                   | Opacity                           |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| `surface` | `surface`, `surface/backdrop`                                                                                                                            | opaque, backdrop translucent      |
| `bg`      | `bg/neutral/subtle`, `bg/neutral`, `bg/<role>/subtle` (accent only), `bg/<role>`, `bg/<role>/emphasized` (each with `/hover`, `/pressed`), `bg/disabled` | opaque, `bg/disabled` translucent |
| `form`    | `form/neutral`, `/hover`, `/pressed`                                                                                                                     | translucent                       |
| `card`    | `card/neutral/subtle`, `card/neutral`, `card/neutral/emphasized`, `card/<status>` (each with states)                                                     | opaque                            |
| `ghost`   | `ghost/<role>/hover`, `/pressed`, `/active`                                                                                                              | translucent                       |
| `fg`      | `fg/<role>/subtle`, `fg/<role>`, `fg/<role>/on-emphasized`, `fg/disabled`                                                                                | opaque, `fg/disabled` translucent |
| `stroke`  | `stroke/<role>/subtle`, `stroke/<role>`, `stroke/<role>/emphasized`, `stroke/disabled`                                                                   | translucent                       |
| `focus`   | `focus/accent`, `focus/accent/subtle`                                                                                                                    | ring opaque, halo translucent     |

The roles are `neutral`, `accent`, `success`, `warning`, `danger` and `info`. A token's opacity follows from its name: the scopes `ghost`, `stroke` and `form`, the `disabled` role, `surface/backdrop` and `focus/accent/subtle` are translucent, and everything else is opaque.

## Color math

- **Color space.** Colors are worked in OKLCH. Hue and chroma come from the seed. Lightness is solved by binary search until a target contrast or ΔL holds.
- **Gamut mapping.** OKLCH → sRGB follows CSS Color 4: chroma is reduced while lightness and hue are kept.
- **Measured as shipped.** Every color is rounded to 8 bits before it is measured. Alphas are rounded up to the next 1/255.
- **Screen lightness.** Every ΔL rule uses screen lightness: `flare` is added in linear light, then OKLab L is taken. Steps near black therefore have to be larger to count. Contrast is plain WCAG 2.
- **Translucent colors.** They are composited in sRGB over each base they can sit on, and the result is what gets measured.

## How a mode is solved

### Search

The background seed is `surface` and never moves. The generator tries up to eight builds in this order:

1. The text on its seeded side of the background, then on the other side.
2. Within that, layers moving towards the text, then away from it.
3. Within that, form fields opposite the layers, then on the layers' side.

The first build that passes the validator wins. If none passes, the generator keeps the build with the lowest cost: every contrast violation costs 1000 and every other violation costs 1. Default themes take the first build.

If the text seed has to move, the generator records an `adjustment` (`{ token, reason, from, to }`). The same goes for compressed text spacing and a focus color that had to move.

### Order inside a build

| #   | Tokens                                                                    | Rule                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `surface`, `bg/neutral/subtle`, `bg/neutral`                              | `bg/neutral/subtle` equals `surface`. `bg/neutral` is one `layerStep` towards the layer side. Each base gets hover and pressed, one `stateStep` each, along the layers                                                                                                                                                                                                                                                                                                                                                             |
| 2   | `form/neutral` (+ states)                                                 | Base: white or black on the form side, at the smallest alpha that moves every neutral base by `formStep`. Hover and pressed: the layer-side pole at the smallest alpha one `stateStep` further on every base                                                                                                                                                                                                                                                                                                                       |
| 3   | `card/neutral/emphasized` (+ states)                                      | White when the text is darker than the background, black when it is lighter: always away from the text, never swapped. On a pure white or pure black background it equals the background, and its stroke and shadow lift it. Hover and pressed step towards the text, one `stateStep` each. Cards count as layers from here on                                                                                                                                                                                                     |
| 4   | `card/neutral/subtle`, `card/neutral` (+ states)                          | Copies of `bg/neutral/subtle` and `bg/neutral`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| 5   | Tints: `bg/accent/subtle` or `card/<status>`, then `bg/<role>` (+ states) | One `layerStep` from the background, then one more. Hue from the role, chroma fixed at `tintChroma`                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 6   | `ghost/<role>/*`                                                          | One color per role: the layer-side pole for neutral, and the role tone at L 0.5 for the others (0.9 or 0.1 when the layers move away from the text). Alphas: hover ≥ 2×`stateStep` from every base (neutral bases and form composites), then pressed and active one `stateStep` further each                                                                                                                                                                                                                                       |
| 7   | `fg/<role>/subtle`, `fg/<role>`                                           | Every text background is collected (layers, cards, tints, ghost composites), and the worst one is the one nearest the text in luminance. `subtle` is the lightness that reaches 4.5:1 on it. `fg/neutral` is the text seed if it is at least `fgStep` beyond the floor, otherwise it moves there. Other roles sit `max(roleTextStep, fgStep)` beyond their floor. When there is no room (mid tones), the primary text sits at white or black and the spacing is compressed, as long as it is ≥ 0.01, and an adjustment is reported |
| 8   | `bg/<role>/emphasized` (+ states), `fg/<role>/on-emphasized`              | Accent and status fills are their seeds, exactly. Neutral is solved to `max(contrast(accent, surface), neutralWeightFloor)` against `surface`. States step away from the on-emphasized text, or towards it when there is no room. On-emphasized text starts near white (L 0.985) or near dark (L 0.2), whichever side contrasts better with the fill, and is pushed towards the pole until it reaches 4.5:1 on the fill and both states                                                                                            |
| 9   | `focus/accent`, `focus/accent/subtle`                                     | The accent fill if it reaches 3:1 on every layer, otherwise moved until it does (an adjustment is reported). The halo is the same color at `focusHaloAlpha`                                                                                                                                                                                                                                                                                                                                                                        |
| 10  | `stroke/<role>/*`                                                         | The role's `fg/<role>` color at `strokeAlpha`. `emphasized` gets the smallest alpha that reaches 3:1 on every layer                                                                                                                                                                                                                                                                                                                                                                                                                |
| 11  | `bg/`, `fg/`, `stroke/disabled`, `surface/backdrop`                       | `fg/neutral` with alpha. `bg/disabled` is the smallest alpha that moves every neutral base by `disabledStep`. `fg/disabled` reaches `disabledContrast` on the bases, the form composites and the disabled fill. `stroke/disabled` uses `strokeAlpha.subtle`. The backdrop is black at `backdropAlpha`                                                                                                                                                                                                                              |

A build counts as feasible only when every step fit inside the lightness range and `validateMode` returns no issues.

## Validator

`validateMode` is independent of the generator. It reads only token names and hex values, and takes its thresholds from `GeneratorParams`, so it can check any theme payload. Rule names:

| Rule                                                        | Checks                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grammar`                                                   | The name follows scope / role / prominence / context / state, with modifiers in order. `fg` has no `emphasized`. `active` exists only on `ghost`. `form` is neutral only and has no prominence. `card` is neutral or status, and status cards have states only. The surface group is exactly `surface` and `surface/backdrop`. `disabled` exists only as `bg/`, `fg/` and `stroke/disabled` |
| `opacity: must be translucent` / `opacity: must be opaque`  | The alpha matches the opacity class given by the name                                                                                                                                                                                                                                                                                                                                       |
| `neutral subtle matches surface`                            | `bg/neutral/subtle` equals `surface`                                                                                                                                                                                                                                                                                                                                                        |
| `layer separation`                                          | `bg/neutral` is ≥ `layerStep` from `surface`                                                                                                                                                                                                                                                                                                                                                |
| `form separation`                                           | `form/neutral` over each stack layer is ≥ `formStep` away, on the same side for all of them                                                                                                                                                                                                                                                                                                 |
| `state separation`                                          | Form hover and pressed composites, and every opaque token with `/hover` and `/pressed`: ≥ `stateStep` per step                                                                                                                                                                                                                                                                              |
| `disabled visibility`                                       | `bg/disabled` over each stack layer is ≥ `disabledStep` away                                                                                                                                                                                                                                                                                                                                |
| `disabled text contrast` / `disabled text reads as enabled` | `fg/disabled` is ≥ `disabledContrast` and < `textContrast` on the stack, form composites and disabled composites                                                                                                                                                                                                                                                                            |
| `text contrast`                                             | `fg/<role>` and `fg/<role>/subtle` reach ≥ `textContrast` on the layers (stack and states, form composites, `card/neutral/emphasized` and its states), on their own role's tints, and on every ghost composited over the stack and form                                                                                                                                                     |
| `fg prominence separation`                                  | `fg/<role>` is ≥ `fgStep` from subtle, or ≥ 0.01 when the primary text is `#ffffff` or `#000000`                                                                                                                                                                                                                                                                                            |
| `bg prominence separation`                                  | `bg/<role>` is ≥ `layerStep` from its tint (`bg/neutral/subtle` for neutral)                                                                                                                                                                                                                                                                                                                |
| `on-emphasized contrast`                                    | `fg/<role>/on-emphasized` reaches ≥ `textContrast` on the fill and both states                                                                                                                                                                                                                                                                                                              |
| `boundary contrast`                                         | `stroke/<role>/emphasized` reaches ≥ `nonTextContrast` on every layer                                                                                                                                                                                                                                                                                                                       |
| `focus contrast`                                            | `focus/accent` reaches ≥ `nonTextContrast` on every layer                                                                                                                                                                                                                                                                                                                                   |
| `focus halo matches ring`                                   | The halo has the ring's RGB                                                                                                                                                                                                                                                                                                                                                                 |
| `ghost states`                                              | Hover, pressed and active all exist                                                                                                                                                                                                                                                                                                                                                         |
| `ghost visibility`                                          | Hover over each stack layer and form composite is ≥ 2×`stateStep` away                                                                                                                                                                                                                                                                                                                      |
| `ghost state separation`                                    | Pressed and active are ≥ `stateStep` past the previous state on the same bases                                                                                                                                                                                                                                                                                                              |

## Palette

`generateRolePalette` builds one ramp per family per mode, and every token binds to a step of a ramp.

**Families.** The neutral family uses the background tone: surface, layers, form, cards. The foreground family uses the text tone: text, the neutral solid fill, on-emphasized text, disabled, neutral strokes and the backdrop. Accent and each status role are families of their own.

**Steps.** A ramp has at least 15 steps, `100`, `150` … `800`, and more when a family has more distinct colors than that. Step `100` is the background end: white in light mode, black in dark mode. The last step is the text end.

**Placement.** Each token color is an anchor placed by role slot, in this order from the background end: surface, the background layers, the emphasized fill and its states, focus, ghost, subtle text, then text, strokes and disabled. On-emphasized text and form fields go with whichever end they are closer to. A dynamic-programming pass keeps the anchors in order on the nearest steps. Steps between two anchors are interpolated in OKLCH, and achromatic ends take the family's hue. A step always means the same role in every family and in both modes. Lightness is not monotonic along a ramp where a role's color is out of that order.

**Exactness.** Anchors are the token colors themselves, exactly. In the export, an opaque token is an alias of its step, and a translucent one takes the step's RGB plus its own alpha.

`generateFixedPalette` (one lightness grid shared by every family) and the curve palettes are prototypes. Theme Lab can show them, but the export does not use them.

## Shadows and focus ring

**Shadow levels.** There are seven: `2xs`, `xs`, `sm`, `md`, `lg`, `xl` and `2xl`.

- `2xs` is a single 1px contact line, with no blur, at `hairline` opacity.
- Every other level has two layers: a tight `contact` layer and a soft `ambient` one.
- The ambient offset grows geometrically from `y.min` to `y.max`. Blur is `offset × blurRatio + blurBase`, spread is `offset × spreadRatio` (negative), and opacity grows by `alphaCurve`. The contact layer is a share of the ambient offset.
- Values are rounded to 0.5px, and opacity to 1%.

**Shadow colors.** Each mode gets layer colors `shadow/<level>/<layer>`. The color is a dark shade of `surface`: its lightness is at most half the surface's, capped at 0.3, and its chroma is ×3, scaled by `tint`. In dark mode the opacity is multiplied by `darkAlphaScale`. Geometry is shared by both modes.

**Edges.** A shadow never draws an element's edge. Edges come from `stroke/*`.

**Focus ring.** It is `0 0 0 1px focus/accent` on top of `0 0 0 4px focus/accent/subtle`, with no offset and no blur.

## DTCG export

The format is DTCG 2025.10. Colors are `{ colorSpace: 'srgb', components, alpha }`. A token that is also a group, such as `focus/accent` next to `focus/accent/subtle`, is stored under `$root`.

|                                               | `toDtcg` (one mode and viewport) | `toDtcgAllModes` (committed file)             |
| --------------------------------------------- | -------------------------------- | --------------------------------------------- |
| Palette                                       | `palette/<family>/<step>`        | `palette/<mode>/<family>/<step>`              |
| Semantic colors and shadows                   | At the root                      | Under `light/` and `dark/`                    |
| Typography                                    | `typography/<style>`             | `typography/desktop/…`, `typography/mobile/…` |
| `font`, `spacing`, `size`, `radius`, `border` | At the root                      | Once, at the root                             |

- **Opaque color.** An alias of its palette step: `"{palette.light.accent.550}"`.
- **Translucent color.** Components through a JSON Pointer, `{ "$ref": "#/palette/light/neutral/750/$value/components" }`, plus its own alpha, since an alias cannot change alpha. A token without an exact step match keeps its literal value.
- **Shadows.** `shadow/<level>` and `focus/ring` are `shadow` composites in px. Each layer's `color` is an alias of the mode's color token, such as `{light.shadow.xs.contact}` or `{light.focus.accent.$root}`. `@reflection/theme` writes these as `var()` references, so a theme that sets the colors also sets the shadows.
- **Typography.**
  - Primitives: `font/size/<step>` and `font/line-height/<step>` in rem, `font/tracking/<step>` as a `number` in em, `font/weight/<name>` and `font/family/<name>`.
  - Composites: `typography/…` references the primitives. `lineHeight` is a ratio, and `letterSpacing` is resolved to rem.
  - The `com.reflection-lense` extension keeps the line-height and tracking references and any `textDecoration` or `textTransform`.
- **Dimensions.**
  - `spacing/<n>` is `n × 0.25rem`, with `spacing/px` at 1px. A decimal point is written as a dash: `spacing/0-5`.
  - `size/<n>` mirrors every spacing step, and `size/<3xs…7xl>` are the containers.
  - `radius/*` is in rem, except `radius/full` at 9999px. `border/width/{0,1,2,4}` is in px.

## Tests

`pnpm test` runs Vitest on `test/generate.test.ts` and `test/dtcg.test.ts`:

- **Color math.** WCAG contrast, the OKLCH round trip, and gamut mapping that keeps lightness.
- **Generator.**
  - The default seeds validate.
  - 300 random seed sets × 2 modes keep the background exactly and pass every rule. The only exemption is the most saturated mid tones, where the two text prominences can fail to separate at the pole.
  - Per-rule cases: form, emphasized card (including white and black backgrounds), card scopes, status cards, exact fills, text side switching, compressed spacing, black backgrounds, surface group, focus halo, adjustments.
- **Type scale.** Tailwind steps, roles per viewport, and the rejection of bad scales.
- **Palette.** Every token sits on a ramp step exactly.
- **Prototypes.** Curves keep the seeds and every rule.
- **Shadows.** Level geometry, and translucent layer colors per mode.
- **DTCG.**
  - The all-modes document matches the single-mode files.
  - Every semantic color resolves to its value.
  - Shadows and the focus ring alias their colors.
  - Palette aliases are opaque.
  - Typography composites reference the type scale.
  - Dimension values are checked against the Figma Number collection.

## Limitations

These are facts about the current code, not targets:

- **Nothing validates the committed export.** `pnpm theme` builds `reflection.tokens.json` without validating it, and there is no CI. Theme Lab shows violations but still exports a failing theme. The randomized test covers the generator, not the committed file.
- **Gaps in `bg prominence separation`.** It checks the tint against `bg/<role>`, but nothing checks `bg/<role>` against `bg/<role>/emphasized`. With a pale accent seed (`#f0f0a0`), the fill can sit within `layerStep` of `bg/accent`, or be lighter than it.
- **Gaps in `text contrast` on neutral text.** The validator does not check `fg/neutral` on status cards or role tints. The generator does include those backgrounds when it solves text, so the gap is only in the validator.
- **Ghosts over cards are not measured.** Ghost fills on `card/neutral/emphasized` (menu rows) are not among the ghost bases in either the generator or the validator.
- **Tint chroma is fixed.** Tinted backgrounds use `tintChroma` (0.03) whatever the role's chroma.
- **The grammar check is looser than the token set.** It accepts `bg/<status>/subtle` and `bg/<role>/on-emphasized`.
- **The DTCG `size/<n>` mirror holds values, not aliases of `spacing/<n>`.** Only `dimensionCssVars` writes the alias.
- **Opacity class is not exported.** It lives only in the token name, with nothing in `$extensions`.
