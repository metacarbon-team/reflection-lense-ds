import { hexToRgba } from './color'
import { generateModeShadows, generateShadows, type ShadowParams } from './shadow'
import { generateTypeScale, type TypeScaleParams } from './typescale'
import type { ModeTheme, Theme } from './types'

export interface DtcgToken {
  $type: 'color' | 'dimension' | 'shadow' | 'fontFamily'
  $value: unknown
}

export interface DtcgGroup {
  [name: string]: DtcgGroup | DtcgToken
}

const dimension = (value: number) => ({ value, unit: 'px' as const })
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

/** One resolved color mode and type viewport per file; no proprietary modes extension. */
export function toDtcg(
  theme: ModeTheme,
  options: { shadows?: ShadowParams; typeScale?: TypeScaleParams; viewport?: 'desktop' | 'mobile' } = {},
): DtcgGroup {
  const result: DtcgGroup = {}
  const put = (name: string, $type: DtcgToken['$type'], $value: unknown) =>
    insert(result, name.split('/'), { $type, $value })
  for (const token of Object.values(theme.tokens)) put(token.name, 'color', color(token.value))

  const shadows = generateModeShadows(theme, options.shadows)
  for (const token of Object.values(shadows.colors)) put(token.name, 'color', color(token.value))
  for (const level of generateShadows(options.shadows)) {
    const layers = (['contact', 'ambient'] as const).flatMap((name) => {
      const layer = level[name]
      if (!layer) return []
      return [
        {
          color: color(shadows.colors[`shadow/${level.name}/${name}`]!.value),
          offsetX: dimension(0),
          offsetY: dimension(layer.y),
          blur: dimension(layer.blur),
          spread: dimension(layer.spread),
        },
      ]
    })
    put(`shadow/${level.name}`, 'shadow', layers)
  }
  for (const step of generateTypeScale(options.typeScale)[options.viewport ?? 'desktop']) {
    put(`font/size/${step.name}`, 'dimension', dimension(step.size))
    put(`font/line-height/${step.name}`, 'dimension', dimension(step.lineHeight))
  }
  put('font/family/sans', 'fontFamily', 'NaN Serf Sans')
  put('font/family/serif', 'fontFamily', 'NaN Serf B')
  put('font/family/mono', 'fontFamily', 'Geist Mono')
  return result
}

/** All modes as ordinary DTCG groups, with shared font families exported once. */
export function toDtcgAllModes(
  theme: Theme,
  options: { shadows?: ShadowParams; typeScale?: TypeScaleParams } = {},
): DtcgGroup {
  const light = toDtcg(theme.light, options)
  const dark = toDtcg(theme.dark, options)
  const desktop = light.font as DtcgGroup
  const mobile = toDtcg(theme.light, { ...options, viewport: 'mobile' }).font as DtcgGroup
  const family = desktop.family!
  delete light.font
  delete dark.font
  delete desktop.family
  delete mobile.family
  return { light, dark, font: { family, desktop, mobile } }
}
