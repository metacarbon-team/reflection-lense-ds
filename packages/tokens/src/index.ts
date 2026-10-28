export * from './types'
export { generateTheme, generateMode } from './generate'
export { validateMode, type Issue } from './validate'
export { generateTypeScale, DEFAULT_TYPE_SCALE, type TypeScaleParams, type TypeStep } from './typescale'
export { cssVarName, toCssVars } from './css'
export { contrast, hexToRgba, rgbaToHex, rgbToOklch, oklchToRgb, composite, lightness } from './color'

/** Placeholder seeds until the default themes' inputs are agreed. */
export const PLACEHOLDER_SEEDS = {
  light: { bg: '#fbfaf7', fg: '#1d1c19', accent: '#4f6bed' },
  dark: { bg: '#141413', fg: '#ecebe7', accent: '#7b93ff' },
} as const
