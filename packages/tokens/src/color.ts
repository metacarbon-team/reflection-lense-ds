// Color math used by the generator and the validator. No dependencies on purpose: the same
// functions must be portable to other platforms and checkable against test vectors.

/** sRGB in gamma space, channels 0..1. */
export interface Rgb {
  r: number
  g: number
  b: number
}

/** sRGB with alpha, channels 0..1. */
export interface Rgba extends Rgb {
  a: number
}

export interface Oklch {
  l: number
  c: number
  h: number
}

const clamp01 = (x: number) => Math.min(1, Math.max(0, x))

export function hexToRgba(hex: string): Rgba {
  const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex.trim())
  if (!m) throw new Error(`Invalid hex color: ${hex}`)
  const n = parseInt(m[1]!, 16)
  return {
    r: ((n >> 16) & 255) / 255,
    g: ((n >> 8) & 255) / 255,
    b: (n & 255) / 255,
    a: m[2] ? parseInt(m[2], 16) / 255 : 1,
  }
}

/** `#rrggbb`, or `#rrggbbaa` when alpha < 1. */
export function rgbaToHex(c: Rgb & { a?: number }): string {
  const ch = (x: number) =>
    Math.round(clamp01(x) * 255)
      .toString(16)
      .padStart(2, '0')
  const a = c.a ?? 1
  return `#${ch(c.r)}${ch(c.g)}${ch(c.b)}${a < 1 ? ch(a) : ''}`
}

const toLinear = (x: number) => (x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)
const toGamma = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)

// OKLab matrices by Björn Ottosson.
function linearToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

function oklabToLinear(L: number, a: number, b: number): [number, number, number] {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
}

export function rgbToOklch(c: Rgb): Oklch {
  const [L, a, b] = linearToOklab(toLinear(c.r), toLinear(c.g), toLinear(c.b))
  const chroma = Math.hypot(a, b)
  const h = chroma < 1e-6 ? 0 : ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360
  return { l: L, c: chroma, h }
}

/** Unclamped linear sRGB; channels outside 0..1 mean the color is out of gamut. */
function oklchToLinear({ l, c, h }: Oklch): [number, number, number] {
  const rad = (h * Math.PI) / 180
  return oklabToLinear(l, c * Math.cos(rad), c * Math.sin(rad))
}

const EPS = 1e-6
const inGamut = ([r, g, b]: [number, number, number]) =>
  r >= -EPS && r <= 1 + EPS && g >= -EPS && g <= 1 + EPS && b >= -EPS && b <= 1 + EPS

/**
 * OKLCH → sRGB with gamut mapping as in CSS Color 4: chroma is reduced, lightness and hue are kept.
 */
export function oklchToRgb(color: Oklch): Rgb {
  const l = clamp01(color.l)
  let lin = oklchToLinear({ ...color, l })
  if (!inGamut(lin)) {
    let lo = 0
    let hi = color.c
    for (let i = 0; i < 24; i++) {
      const mid = (lo + hi) / 2
      if (inGamut(oklchToLinear({ l, c: mid, h: color.h }))) lo = mid
      else hi = mid
    }
    lin = oklchToLinear({ l, c: lo, h: color.h })
  }
  return { r: clamp01(toGamma(lin[0])), g: clamp01(toGamma(lin[1])), b: clamp01(toGamma(lin[2])) }
}

/** WCAG 2 relative luminance. */
export function luminance(c: Rgb): number {
  return 0.2126 * toLinear(c.r) + 0.7152 * toLinear(c.g) + 0.0722 * toLinear(c.b)
}

/** WCAG 2 contrast ratio, 1..21. */
export function contrast(a: Rgb, b: Rgb): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** Normal alpha blending in sRGB. */
export function composite(top: Rgba, bottom: Rgb): Rgb {
  return {
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
  }
}

/** OKLCH lightness of an sRGB color. */
export const lightness = (c: Rgb) => rgbToOklch(c).l

/**
 * Lightness as seen on a real screen — the axis every ΔL rule is measured on. A display never shows
 * pure black and reflects ambient light, so a little flare (a share of white, in linear light) is added
 * before taking OKLab lightness: steps near black, which that flare swamps, have to be larger to count
 * the same. Near white it changes almost nothing. A flare of 0 gives plain OKLCH lightness.
 */
export function perceivedLightness(c: Rgb, flare: number): number {
  if (!flare) return lightness(c)
  const lin = (v: number) => (toLinear(v) + flare) / (1 + flare)
  return linearToOklab(lin(c.r), lin(c.g), lin(c.b))[0]
}

/** Smallest angle between two hues, in degrees. */
export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360
  return d > 180 ? 360 - d : d
}

/**
 * Moves lightness from `start` in `dir` (+1 lighter, −1 darker) until the color reaches `target`
 * contrast against `against`. Returns the closest such lightness, or the extreme (0 or 1) if the
 * target is unreachable. Contrast grows monotonically along `dir` once the color passes the
 * background's luminance, which is the only case the generator uses.
 */
export function lightnessForContrast(
  base: Pick<Oklch, 'c' | 'h'> | ((l: number) => Oklch),
  start: number,
  dir: 1 | -1,
  against: Rgb,
  target: number,
): number {
  const at = (l: number) =>
    contrast(oklchToRgb(typeof base === 'function' ? base(l) : { l, c: base.c, h: base.h }), against)
  if (at(start) >= target) return start
  const end = dir > 0 ? 1 : 0
  if (at(end) < target) return end
  let lo = start
  let hi = end
  for (let i = 0; i < 32; i++) {
    const mid = (lo + hi) / 2
    if (at(mid) >= target) hi = mid
    else lo = mid
  }
  return hi
}
