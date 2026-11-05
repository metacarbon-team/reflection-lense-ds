// Everything the Lab derives from the seeds and parameters, computed once per change and shared by
// every tab: the theme, its role palettes, the palette-resolved theme and the validator's issues.

import {
  applyPalette,
  generateRolePalette,
  generateTheme,
  validateMode,
  type GeneratorParams,
  type Issue,
  type Mode,
  type ModePalette,
  type Theme,
  type ThemeSeeds,
} from '@reflection/tokens'

export interface Generated {
  theme: Theme
  palettes: Record<Mode, ModePalette>
  /** The theme with every token resolved through its palette step, as exported. */
  resolved: Theme
  issues: Record<Mode, Issue[]>
}

export function generate(seeds: ThemeSeeds, params: GeneratorParams): Generated {
  const theme = generateTheme(seeds, params)
  const palettes = { light: generateRolePalette(theme.light), dark: generateRolePalette(theme.dark) }
  return {
    theme,
    palettes,
    resolved: { light: applyPalette(theme.light, palettes.light), dark: applyPalette(theme.dark, palettes.dark) },
    issues: { light: validateMode(theme.light, params), dark: validateMode(theme.dark, params) },
  }
}
