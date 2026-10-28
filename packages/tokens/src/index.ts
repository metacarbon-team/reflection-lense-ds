export * from './types'
export { generateTheme, generateMode } from './generate'
export { validateMode, type Issue } from './validate'
export { generateTypeScale, DEFAULT_TYPE_SCALE, type TypeScaleParams, type TypeStep } from './typescale'
export {
  generateModeShadows,
  generateShadows,
  shadowColor,
  shadowCss,
  DEFAULT_SHADOWS,
  SHADOW_LAYERS,
  SHADOW_LEVELS,
  type ModeShadows,
  type ShadowLayer,
  type ShadowLevel,
  type ShadowParams,
} from './shadow'
export { cssVarName, toCssVars } from './css'
export { contrast, hexToRgba, rgbaToHex, rgbToOklch, oklchToRgb, composite, lightness } from './color'

/**
 * Default theme seeds: warm paper and near-black in light, the same pair swapped in dark. The lime
 * accent of the "Mirror · CLI parity" concept (Figma node 2850:3075) is the dark accent; light uses a
 * muted olive of the same family.
 */
export const DEFAULT_SEEDS = {
  light: { bg: '#faf8f3', fg: '#1a1b1a', accent: '#627150' },
  dark: { bg: '#1a1b1a', fg: '#f8f6f0', accent: '#cee04b' },
} as const
