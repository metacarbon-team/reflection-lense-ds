import { hexToRgba, rgbaToHex } from './color'
import { dimensionTokens, px, rem } from './dimensions'
import { generateRolePalette, type ModePalette } from './palette'
import { generateModeShadows, generateShadows, type ShadowParams } from './shadow'
import {
  DEFAULT_TYPE_SCALE,
  FONT_WEIGHTS,
  textStyles,
  weightName,
  type TypeScaleParams,
  type Viewport,
} from './typescale'
import { FOCUS, FOCUS_HALO, type Mode, type ModeTheme, type Theme } from './types'

export interface DtcgToken {
  $type: 'color' | 'dimension' | 'number' | 'shadow' | 'fontFamily' | 'fontWeight' | 'typography'
  $value: unknown
  $extensions?: Record<string, unknown>
}

/** Namespace for values DTCG has no field for (ADR 0030). */
export const DTCG_EXTENSION = 'com.reflection-lense'
const FAMILIES = { sans: 'NaN Serf Sans', serif: 'NaN Serf B', mono: 'Geist Mono' }

export interface DtcgGroup {
  [name: string]: DtcgGroup | DtcgToken
}

/** Mode-independent groups; the all-modes document stores them once (ADR 0029, ADR 0030). */
const SHARED_GROUPS = ['font', 'spacing', 'size', 'radius', 'border'] as const
const color = (hex: string) => {
  const { r, g, b, a } = hexToRgba(hex)
  return { colorSpace: 'srgb', components: [r, g, b], alpha: a }
}

/** Preserve both a base token and its variants using DTCG 2025.10's reserved $root token. */
function insert(group: DtcgGroup, path: string[], token: DtcgToken): void {
  const [key, ...rest] = path
  if (!key || key.startsWith('$') || /[.{}]/.test(key)) throw new Error(`Invalid DTCG path: ${path.join('/')}`)
  const existing = group[key]
  if (!rest.length) {
    if (existing && !('$value' in existing)) (existing as DtcgGroup).$root = token
    else group[key] = token
    return
  }
  const child: DtcgGroup = !existing ? {} : '$value' in existing ? { $root: existing } : (existing as DtcgGroup)
  group[key] = child
  insert(child, rest, token)
}

export interface DtcgOptions {
  shadows?: ShadowParams
  typeScale?: TypeScaleParams
  viewport?: Viewport
  /** Role palette the colors alias; generated from the theme when left out (ADR 0013). */
  palette?: ModePalette
  /** Where the palette group sits in the document; `palette` in a single-mode file (ADR 0034). */
  palettePath?: string[]
}

/**
 * The palette group and the semantic colors that alias it (ADR 0034). An opaque color is a DTCG alias
 * of its step; a translucent one takes the step's components by a JSON Pointer `$ref` and keeps its
 * own alpha, since an alias cannot change alpha.
 */
function putColors(result: DtcgGroup, theme: ModeTheme, palette: ModePalette, root: string[]): void {
  const steps = new Map<string, string>()
  for (const ramp of palette.ramps)
    for (const step of ramp.steps) {
      const path = [...root, ramp.family, String(step.step)]
      steps.set(path.join('/'), step.value)
      insert(result, path, { $type: 'color', $value: color(step.value) })
    }
  for (const token of Object.values(theme.tokens)) {
    const binding = palette.bindings[token.name]
    const path = binding && [...root, binding.family, String(binding.step)]
    const step = path && steps.get(path.join('/'))
    const own = hexToRgba(token.value)
    // A token is written as an alias only when resolving the alias gives its exact value back.
    if (!path || !step || hexToRgba(step).a !== 1 || rgbaToHex({ ...hexToRgba(step), a: own.a }) !== token.value) {
      insert(result, token.name.split('/'), { $type: 'color', $value: color(token.value) })
      continue
    }
    const $value =
      own.a === 1
        ? `{${path.join('.')}}`
        : { colorSpace: 'srgb', components: { $ref: `#/${path.join('/')}/$value/components` }, alpha: own.a }
    insert(result, token.name.split('/'), { $type: 'color', $value })
  }
}

/**
 * One color mode and type viewport per file; no proprietary modes extension. Semantic colors alias
 * the palette group of the same file (ADR 0034).
 */
export function toDtcg(theme: ModeTheme, options: DtcgOptions = {}): DtcgGroup {
  const result: DtcgGroup = {}
  const put = (name: string, $type: DtcgToken['$type'], $value: unknown) =>
    insert(result, name.split('/'), { $type, $value })
  putColors(result, theme, options.palette ?? generateRolePalette(theme), options.palettePath ?? ['palette'])

  const shadows = generateModeShadows(theme, options.shadows)
  for (const token of Object.values(shadows.colors)) put(token.name, 'color', color(token.value))
  for (const level of generateShadows(options.shadows)) {
    const layers = (['contact', 'ambient'] as const).flatMap((name) => {
      const layer = level[name]
      if (!layer) return []
      return [
        {
          color: color(shadows.colors[`shadow/${level.name}/${name}`]!.value),
          offsetX: px(0),
          offsetY: px(layer.y),
          blur: px(layer.blur),
          spread: px(layer.spread),
        },
      ]
    })
    put(`shadow/${level.name}`, 'shadow', layers)
  }
  // The focus ring of ADR 0025: a 1px ring over a 4px translucent halo, ring first (on top).
  const ring = (token: string, spread: number) => ({
    color: color(theme.tokens[token]!.value),
    offsetX: px(0),
    offsetY: px(0),
    blur: px(0),
    spread: px(spread),
  })
  put('focus/ring', 'shadow', [ring(FOCUS, 1), ring(FOCUS_HALO, 4)])
  const typeScale = options.typeScale ?? DEFAULT_TYPE_SCALE
  for (const step of typeScale.steps) {
    put(`font/size/${step.name}`, 'dimension', rem(step.size))
    put(`font/line-height/${step.name}`, 'dimension', rem(step.lineHeight))
  }
  for (const [name, em] of Object.entries(typeScale.tracking)) put(`font/tracking/${name}`, 'number', em)
  for (const [name, weight] of Object.entries(FONT_WEIGHTS)) put(`font/weight/${name}`, 'fontWeight', weight)
  for (const [name, family] of Object.entries(FAMILIES)) put(`font/family/${name}`, 'fontFamily', family)
  // Composite styles reference the primitives. DTCG's lineHeight is a ratio, so the step's line-height
  // token travels in $extensions, with underline and uppercase.
  for (const style of textStyles(typeScale, options.viewport ?? 'desktop')) {
    const extension: Record<string, string> = {
      lineHeight: `{font.line-height.${style.step.name}}`,
      letterSpacing: `{font.tracking.${style.tracking.name}}`,
    }
    if (style.decoration) extension.textDecoration = style.decoration
    if (style.textCase) extension.textTransform = style.textCase
    insert(result, `typography/${style.name}`.split('/'), {
      $type: 'typography',
      $value: {
        fontFamily: `{font.family.${style.family}}`,
        fontSize: `{font.size.${style.step.name}}`,
        fontWeight: `{font.weight.${weightName(style.weight)}}`,
        // DTCG has no em: tracking resolved against this style's size (ADR 0031).
        letterSpacing: rem(Math.round(style.tracking.em * style.step.size * 1e6) / 1e6),
        lineHeight: Math.round((style.step.lineHeight / style.step.size) * 10000) / 10000,
      },
      $extensions: { [DTCG_EXTENSION]: extension },
    })
  }
  for (const token of dimensionTokens()) put(token.name, 'dimension', token.value)
  return result
}

/**
 * All modes as ordinary DTCG groups; the type scale, font families and dimensions are exported once.
 * Each mode's palette sits under `palette/<mode>`, next to the mode's semantic colors (ADR 0034).
 */
export function toDtcgAllModes(
  theme: Theme,
  options: { shadows?: ShadowParams; typeScale?: TypeScaleParams; palettes?: Partial<Record<Mode, ModePalette>> } = {},
): DtcgGroup {
  const { palettes, ...rest } = options
  const mode = (m: Mode) => toDtcg(theme[m], { ...rest, palette: palettes?.[m], palettePath: ['palette', m] })
  const light = mode('light')
  const dark = mode('dark')
  const mobile = toDtcg(theme.light, { ...rest, palette: palettes?.light, viewport: 'mobile' })
  const typography = { desktop: light.typography!, mobile: mobile.typography! }
  const palette: DtcgGroup = {
    light: (light.palette as DtcgGroup).light!,
    dark: (dark.palette as DtcgGroup).dark!,
  }
  const shared: DtcgGroup = {}
  for (const group of SHARED_GROUPS) shared[group] = light[group]!
  for (const m of [light, dark]) for (const group of ['palette', ...SHARED_GROUPS, 'typography']) delete m[group]
  return { palette, light, dark, ...shared, typography }
}
