export * from './types'
export { generateTheme, generateMode } from './generate'
export { validateMode, type Issue } from './validate'
export { generateTypeScale, DEFAULT_TYPE_SCALE, type TypeScaleParams, type TypeStep } from './typescale'
export { cssVarName, toCssVars } from './css'
export { contrast, hexToRgba, rgbaToHex, rgbToOklch, oklchToRgb, composite, lightness } from './color'

/**
 * Default theme seeds. Light reproduces the "Mirror · CLI parity" concept (Figma node 2850:3075):
 * warm paper background, warm near-black text, lime accent. Dark is still a placeholder.
 */
export const DEFAULT_SEEDS = {
  light: { bg: '#faf8f3', fg: '#29241a', accent: '#cee04b' },
  dark: { bg: '#141413', fg: '#ecebe7', accent: '#7b93ff' },
} as const
