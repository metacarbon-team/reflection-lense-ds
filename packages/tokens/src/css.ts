import { hexToRgba } from './color'
import { generateRolePalette, paletteAlias, type ModePalette } from './palette'
import { generateModeShadows, type ShadowParams } from './shadow'
import type { ModeTheme } from './types'

/** Canonical token name → CSS custom property: `bg/accent/emphasized/hover` → `--bg-accent-emphasized-hover`. */
export const cssVarName = (name: string) => `--${name.replaceAll('/', '-')}`

export interface CssVarsOptions {
  /** Role palette the colors alias; generated from the theme when left out. */
  palette?: ModePalette
  /** Shadow parameters for the layer colors; the defaults when left out. */
  shadows?: ShadowParams
}

/** Alpha as a percentage for `color-mix`, exact to the 8-bit value it came from. */
const percent = (alpha: number) => `${Math.round(alpha * 1e6) / 1e4}%`

/**
 * CSS custom properties of one mode, with the names and values `@reflection/theme` writes for it:
 * - palette steps, `--palette-<mode>-<family>-<step>: #rrggbb`;
 * - semantic colors as their palette step, `var(--palette-light-accent-650)`, or for a translucent color
 *   the step mixed with transparent at the token's alpha; a color with no exact step keeps its hex;
 * - shadow layer colors, `--shadow-<level>-<layer>`, which the shadow utilities read.
 *
 * Ready for a `style` attribute or a stylesheet rule: a runtime theme that sets them restyles every color
 * and shadow below it.
 */
export function toCssVars(theme: ModeTheme, options: CssVarsOptions = {}): Record<string, string> {
  const palette = options.palette ?? generateRolePalette(theme)
  const step = (family: string, n: number) => `--palette-${theme.mode}-${family}-${n}`
  const vars: Record<string, string> = {}
  for (const ramp of palette.ramps) for (const s of ramp.steps) vars[step(ramp.family, s.step)] = s.value
  for (const token of Object.values(theme.tokens)) {
    const alias = paletteAlias(palette, token)
    const ref = alias && `var(${step(alias.family, alias.step)})`
    vars[cssVarName(token.name)] = !alias
      ? token.value
      : alias.alpha === 1
        ? ref!
        : `color-mix(in srgb, ${ref} ${percent(hexToRgba(token.value).a)}, transparent)`
  }
  for (const token of Object.values(generateModeShadows(theme, options.shadows).colors))
    vars[cssVarName(token.name)] = token.value
  return vars
}
