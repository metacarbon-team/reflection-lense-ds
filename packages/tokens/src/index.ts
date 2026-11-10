export * from './types'
export { DTCG_EXTENSION, toDtcg, toDtcgAllModes, type DtcgGroup, type DtcgOptions, type DtcgToken } from './dtcg'
export { generateTheme, generateMode } from './generate'
export { validateMode, type Issue } from './validate'
export {
  DEFAULT_TYPE_SCALE,
  FONT_WEIGHTS,
  textStyles,
  validateTypeScale,
  VIEWPORTS,
  type FontFamily,
  type TextRole,
  type TextStyle,
  type TypeScaleParams,
  type TypeStep,
  type Viewport,
} from './typescale'
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
export {
  applyPalette,
  familyOf,
  generateFixedPalette,
  generateRolePalette,
  RAMP_STEPS,
  type ModePalette,
  type PaletteBinding,
  type Ramp,
  type RampStep,
} from './palette'
export {
  BRAND_SHAPES,
  curveKeys,
  familyCurve,
  generateCurvePalette,
  shapeCurve,
  toneFor,
  DEFAULT_CURVE,
  type CurveParams,
} from './curve'
export { cssVarName, dimensionCssVars, toCssVars } from './css'
export {
  BORDER_WIDTHS,
  CONTAINER_SIZES,
  dimensionTokens,
  RADII,
  REM_BASE,
  SPACING_STEPS,
  toPx,
  type Dimension,
  type DimensionToken,
} from './dimensions'
export { contrast, hexToRgba, rgbaToHex, rgbToOklch, oklchToRgb, composite, lightness } from './color'

/**
 * Default theme seeds from the brand palette (Branding page): Off White and Off Black, swapped
 * between the modes, and Neon Yellow as the accent in both.
 */
export const DEFAULT_SEEDS = {
  light: { bg: '#f8f6f0', fg: '#1a1b1a', accent: '#cee04b' },
  dark: { bg: '#1a1b1a', fg: '#f8f6f0', accent: '#cee04b' },
} as const
