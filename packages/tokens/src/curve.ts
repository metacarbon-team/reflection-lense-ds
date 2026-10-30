// Prototype: Leonardo-style color curves. With `params.curve` set, the generator takes every color's
// chroma and hue from its family's curve at the lightness it solves, so every rule still holds and
// every color of a family is a function of lightness: its ramp is smooth by construction. A curve
// runs from white to black through the seed: with chroma falling off evenly (`seed`), or with the
// shape of the family's brand ramp (`brand`): its lightness spread and chroma profile, never its hue.

import { hexToRgba, oklchToRgb, rgbaToHex, rgbToOklch, type Oklch } from './color'
import { generateFixedPalette, type ModePalette } from './palette'
import { STATUS_ROLES, type CurveParams, type GeneratorParams, type ModeSeeds, type ModeTheme } from './types'

export type { CurveParams }

export const DEFAULT_CURVE: CurveParams = { lightPower: 1, darkPower: 1, tint: 1, hueShift: 0, source: 'seed' }

const oklch = (hex: string) => rgbToOklch(hexToRgba(hex))

/** The family's curve: chroma and hue at a lightness, passing exactly through the key color. */
export function familyCurve(key: Oklch, p: CurveParams = DEFAULT_CURVE) {
  return (l: number): Oklch => {
    const lighter = l >= key.l
    const side = lighter ? (1 - l) / Math.max(1 - key.l, 1e-9) : l / Math.max(key.l, 1e-9)
    const c = key.c * Math.max(0, Math.min(1, side)) ** (lighter ? p.lightPower : p.darkPower)
    const toEnd = lighter ? (l - key.l) / Math.max(1 - key.l, 1e-9) : (l - key.l) / Math.max(key.l, 1e-9)
    return { l, c, h: key.h + p.hueShift * toEnd }
  }
}

/** Brand ramp colors (Branding page) a family's curve takes its shape from, and the ramp's core color. */
interface BrandShape {
  ramp: string[]
  /** The ramp's core color; empty for neutrals, whose core is their step nearest the seed. */
  core: string
}

/**
 * Chroma below which a core counts as grey: ratios are taken against at least this much, so a
 * near-grey seed (whose hue is noise) never gets more chroma than the brand ramp itself has.
 */
const GREY = 0.01

const NEUTRAL = ['#f8f6f0', '#f1ede1', '#e7e2d5', '#d4cfc3', '#9a958e', '#696761', '#45413d', '#1a1b1a']
const TANGERINE: BrandShape = { ramp: ['#ffc3ae', '#f57042', '#8d3b1b'], core: '#f57042' }

/**
 * Brand shapes per family, from Color / 07 · Digital colors and Color / 04 · Secondary colors (which
 * shows only a light, core and dark step). Danger has no brand ramp and takes Tangerine's shape.
 * Only the shape is taken: how lightness is spread and how chroma rises and falls along the ramp
 * around its core. Hue always stays the seed's.
 */
export const BRAND_SHAPES: Record<string, BrandShape> = {
  neutral: { ramp: NEUTRAL, core: '' },
  foreground: { ramp: NEUTRAL, core: '' },
  accent: {
    ramp: ['#fcfded', '#f1f8b9', '#e5f18e', '#cee04b', '#b5c642', '#9eaa39', '#707a29', '#535a1f'],
    core: '#cee04b',
  },
  success: { ramp: ['#d9f5db', '#51c35b', '#245528'], core: '#51c35b' },
  info: { ramp: ['#afc9ff', '#4880ff', '#2b4d99'], core: '#4880ff' },
  warning: TANGERINE,
  danger: TANGERINE,
}

/**
 * A curve with the shape of a brand ramp, moved onto the seed. The ramp's lightness is remapped so its
 * core lands on the seed's lightness (white and black stay), chroma follows the ramp as a multiple of
 * the core's, and hue is the seed's everywhere. Passes exactly through the seed. A neutral ramp's core is
 * its color nearest the seed in lightness.
 */
export function shapeCurve(shape: BrandShape, seed: Oklch) {
  const ramp = shape.ramp.map(oklch).sort((a, b) => b.l - a.l)
  const core = shape.core
    ? oklch(shape.core)
    : ramp.reduce((a, b) => (Math.abs(b.l - seed.l) < Math.abs(a.l - seed.l) ? b : a))
  const points = [{ l: 1, c: 0 }, ...ramp, { l: 0, c: 0 }]
  /** The ramp's chroma at its own lightness, interpolated between neighbouring steps. */
  const chromaAt = (l: number) => {
    let i = 0
    while (i < points.length - 2 && points[i + 1]!.l > l) i++
    const a = points[i]!
    const b = points[i + 1]!
    return a.l === b.l ? a.c : a.c + ((b.c - a.c) * (a.l - l)) / (a.l - b.l)
  }
  return (l: number): Oklch => {
    if (Math.abs(l - seed.l) < 1e-9) return seed
    // Where l sits relative to the seed, in the ramp's lightness relative to its core.
    const lr =
      l >= seed.l
        ? core.l + ((l - seed.l) * (1 - core.l)) / Math.max(1 - seed.l, 1e-9)
        : (l * core.l) / Math.max(seed.l, 1e-9)
    const cr = chromaAt(lr)
    const c = (seed.c * cr) / Math.max(core.c, GREY)
    return { l, c, h: seed.h }
  }
}

/** The tone of a family: its curve through the seed, or the seed carried along its brand ramp's shape. */
export function toneFor(family: string, key: Oklch, p: CurveParams): (l: number) => Oklch {
  const shape = p.source === 'brand' ? BRAND_SHAPES[family] : undefined
  return shape ? shapeCurve(shape, key) : familyCurve(key, p)
}

/** Key color of every family: the seeds of the mode and the status base colors. */
export function curveKeys(seeds: ModeSeeds, params: GeneratorParams): Record<string, string> {
  return {
    neutral: seeds.bg,
    foreground: seeds.fg,
    accent: seeds.accent,
    ...Object.fromEntries(STATUS_ROLES.map((r) => [r, params.statusSeeds[r]])),
  }
}

/** Fixed-step palette of a curve-generated mode, its fill steps sampled from the curves too. */
export function generateCurvePalette(
  theme: ModeTheme,
  keys: Record<string, string>,
  p: CurveParams = DEFAULT_CURVE,
): ModePalette {
  const curves = Object.fromEntries(
    Object.entries(keys).map(([family, hex]) => [family, toneFor(family, oklch(hex), p)]),
  )
  return generateFixedPalette(theme, (family, l) => rgbaToHex(oklchToRgb(curves[family]!(l))))
}
