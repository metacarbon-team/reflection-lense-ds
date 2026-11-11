// Elevation shadows, tuned in the Theme Lab. Each level is a tight contact shadow plus a
// soft ambient one, as on the Mirror concept; the smallest level (2xs) is only a crisp 1px contact
// line. Edges are not part of a shadow: they come from stroke tokens.

import { hexToRgba, oklchToRgb, rgbaToHex, rgbToOklch, type Rgb } from './color'
import { SURFACE, type ModeTheme, type Token } from './types'

export const SHADOW_LEVELS = ['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'] as const
export const SHADOW_LAYERS = ['contact', 'ambient'] as const

export interface ShadowParams {
  /** Ambient offset (px) at the start and the end of the ramp; levels in between grow geometrically. The ramp
   *  starts at the 2xs position, which is drawn as a hairline, so xs is the first level that uses it. */
  y: { min: number; max: number }
  /** Ambient blur = offset × ratio + base. */
  blurRatio: number
  blurBase: number
  /** Ambient spread = offset × ratio; negative tucks the shadow under the element. */
  spreadRatio: number
  /** Ambient opacity at the start and the end of the ramp. */
  alpha: { min: number; max: number }
  /** Exponent on the level position for opacity: above 1 keeps small levels light. */
  alphaCurve: number
  /** Contact layer: offset and blur relative to the ambient offset, opacity from smallest to largest level. */
  contact: { yRatio: number; blurRatio: number; alpha: { min: number; max: number } }
  /** Opacity of 2xs: a 1px line under the element, no blur. */
  hairline: number
  /** 0 = black shadows, 1 = dark shadows in the hue of the mode's surface. */
  tint: number
  /** Opacity multiplier in dark mode, where shadows need more weight to read. */
  darkAlphaScale: number
}

export const DEFAULT_SHADOWS: ShadowParams = {
  y: { min: 0.5, max: 24 },
  blurRatio: 3,
  blurBase: 0,
  spreadRatio: -0.55,
  alpha: { min: 0.07, max: 0.12 },
  alphaCurve: 2.3,
  contact: { yRatio: 0.15, blurRatio: 2, alpha: { min: 0.04, max: 0.06 } },
  hairline: 0.05,
  tint: 1,
  darkAlphaScale: 4,
}

export interface ShadowLayer {
  y: number
  blur: number
  spread: number
  alpha: number
}

export interface ShadowLevel {
  name: (typeof SHADOW_LEVELS)[number]
  contact: ShadowLayer
  /** Absent on the hairline level (2xs). */
  ambient: ShadowLayer | null
}

const half = (x: number) => Math.round(x * 2) / 2
const percent = (x: number) => Math.round(Math.min(1, Math.max(0, x)) * 100) / 100

export function generateShadows(p: ShadowParams = DEFAULT_SHADOWS): ShadowLevel[] {
  const last = SHADOW_LEVELS.length - 1
  return SHADOW_LEVELS.map((name, i) => {
    if (i === 0) return { name, contact: { y: 1, blur: 0, spread: 0, alpha: percent(p.hairline) }, ambient: null }
    const t = i / last
    const y = p.y.min * (p.y.max / p.y.min) ** t
    const cy = y * p.contact.yRatio
    return {
      name,
      contact: {
        y: half(cy),
        blur: half(Math.max(cy * p.contact.blurRatio, 1)),
        spread: 0,
        alpha: percent(p.contact.alpha.min + (p.contact.alpha.max - p.contact.alpha.min) * t),
      },
      ambient: {
        y: half(y),
        blur: half(y * p.blurRatio + p.blurBase),
        spread: half(y * p.spreadRatio),
        alpha: percent(p.alpha.min + (p.alpha.max - p.alpha.min) * t ** p.alphaCurve),
      },
    }
  })
}

/**
 * Shadow color: black, or a dark shade of the surface it falls on. A shadow is mostly transparent, so
 * the surface chroma is tripled to stay visible after compositing. Lightness stays at most half the
 * surface's, so a tinted shadow never turns into a glow on dark surfaces.
 */
export function shadowColor(surface: string, tint: number): Rgb {
  const s = rgbToOklch(hexToRgba(surface))
  return oklchToRgb({ l: Math.min(0.3, s.l / 2) * tint, c: s.c * 3 * tint, h: s.h })
}

/** CSS `box-shadow` for a level. */
export function shadowCss(level: ShadowLevel, color: Rgb, alphaScale = 1): string {
  const layer = (l: ShadowLayer) =>
    `0 ${l.y}px ${l.blur}px${l.spread ? ` ${l.spread}px` : ''} ${rgbaToHex({ ...color, a: percent(l.alpha * alphaScale) })}`
  return [level.contact, level.ambient].flatMap((l) => (l ? [layer(l)] : [])).join(', ')
}

export interface ModeShadows {
  /** Layer colors, `shadow/<level>/<layer>`: translucent, for Figma variables and per-layer platforms. */
  colors: Record<string, Token>
  /** Composite shadows, `shadow/<level>`, as CSS `box-shadow` values. */
  composite: Record<string, string>
}

/** Shadow tokens of one mode: geometry is shared, color follows the mode's surface. */
export function generateModeShadows(theme: ModeTheme, p: ShadowParams = DEFAULT_SHADOWS): ModeShadows {
  const color = shadowColor(theme.tokens[SURFACE]!.value, p.tint)
  const scale = theme.mode === 'dark' ? p.darkAlphaScale : 1
  const colors: Record<string, Token> = {}
  const composite: Record<string, string> = {}
  for (const level of generateShadows(p)) {
    for (const layer of SHADOW_LAYERS) {
      const l = level[layer]
      if (!l) continue
      const name = `shadow/${level.name}/${layer}`
      colors[name] = { name, value: rgbaToHex({ ...color, a: percent(l.alpha * scale) }), opacity: 'translucent' }
    }
    composite[`shadow/${level.name}`] = shadowCss(level, color, scale)
  }
  return { colors, composite }
}
