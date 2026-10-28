import { describe, expect, it } from 'vitest'
import { composite, contrast, hexToRgba, oklchToRgb, rgbaToHex, rgbToOklch } from '../src/color'
import { generateMode, generateTheme } from '../src/generate'
import { DEFAULT_SEEDS } from '../src/index'
import { generateModeShadows, generateShadows, shadowCss } from '../src/shadow'
import { generateTypeScale } from '../src/typescale'
import { validateMode } from '../src/validate'

describe('color math', () => {
  it('computes WCAG contrast', () => {
    expect(contrast(hexToRgba('#000000'), hexToRgba('#ffffff'))).toBeCloseTo(21, 5)
    expect(contrast(hexToRgba('#777777'), hexToRgba('#ffffff'))).toBeCloseTo(4.48, 2)
  })

  it('round-trips sRGB through OKLCH', () => {
    for (const hex of ['#4f6bed', '#fbfaf7', '#141413', '#c62828', '#00ff00']) {
      expect(rgbaToHex(oklchToRgb(rgbToOklch(hexToRgba(hex))))).toBe(hex)
    }
  })

  it('maps out-of-gamut colors into sRGB keeping lightness', () => {
    const out = oklchToRgb({ l: 0.7, c: 0.4, h: 150 })
    for (const ch of [out.r, out.g, out.b]) expect(ch).toBeGreaterThanOrEqual(0)
    expect(rgbToOklch(out).l).toBeCloseTo(0.7, 2)
  })
})

describe('generator', () => {
  it('produces a valid theme from the default seeds', () => {
    const theme = generateTheme(DEFAULT_SEEDS)
    expect(validateMode(theme.light)).toEqual([])
    expect(validateMode(theme.dark)).toEqual([])
  })

  it('never produces an invalid mode, whatever the seeds (ADR 0003: shift, never reject)', () => {
    const random = mulberry32(20261028)
    const hex = () =>
      '#' +
      Array.from({ length: 3 }, () =>
        Math.floor(random() * 256)
          .toString(16)
          .padStart(2, '0'),
      ).join('')
    const failures: string[] = []
    for (let i = 0; i < 300; i++) {
      const seeds = { bg: hex(), fg: hex(), accent: hex() }
      for (const mode of ['light', 'dark'] as const) {
        const issues = validateMode(generateMode(mode, seeds))
        if (issues.length)
          failures.push(
            `${JSON.stringify(seeds)} ${mode}: ${issues[0]!.rule} ${issues[0]!.token} ${issues[0]!.actual}/${issues[0]!.required} vs ${issues[0]!.against}`,
          )
      }
    }
    expect(failures.slice(0, 10)).toEqual([])
  }, 120_000)

  it('makes raised translucent, lighter in light themes and sunken in dark ones (ADR 0007)', () => {
    const theme = generateTheme(DEFAULT_SEEDS)
    for (const mode of [theme.light, theme.dark]) {
      const raised = hexToRgba(mode.tokens['bg/neutral/raised']!.value)
      const surface = hexToRgba(mode.tokens['surface/neutral']!.value)
      const over = rgbToOklch(composite(raised, surface)).l - rgbToOklch(surface).l
      expect(mode.tokens['bg/neutral/raised']!.opacity).toBe('translucent')
      expect(raised.a).toBeLessThan(1)
      expect(mode.mode === 'light' ? over : -over).toBeGreaterThan(0)
    }
    // A pure white seed leaves no room above it: the surface steps down and says so.
    const white = generateMode('light', { bg: '#ffffff', fg: '#111111', accent: '#1d4ed8' })
    expect(white.tokens['surface/neutral']!.value).not.toBe('#ffffff')
    expect(white.adjustments.some((a) => a.token === 'surface/neutral')).toBe(true)
  })

  it('keeps an accessible accent seed exactly', () => {
    const mode = generateMode('light', { bg: '#ffffff', fg: '#111111', accent: '#1d4ed8' })
    expect(mode.tokens['bg/accent/emphasized']!.value).toBe('#1d4ed8')
  })

  it('reports what it shifted', () => {
    const mode = generateMode('light', { bg: '#ffffff', fg: '#111111', accent: '#ffe066' })
    expect(mode.adjustments.some((a) => a.token === 'bg/accent/emphasized')).toBe(false)
    const midGray = generateMode('light', { bg: '#808080', fg: '#7a7a7a', accent: '#808080' })
    expect(midGray.adjustments.length).toBeGreaterThan(0)
  })
})

describe('type scale', () => {
  it('keeps the fixed small sizes and grows from base by the ratio', () => {
    const { desktop, mobile } = generateTypeScale()
    expect(desktop.slice(0, 4).map((s) => s.size)).toEqual([12, 13, 14, 16])
    expect(desktop.find((s) => s.name === 'lg')!.size).toBe(20)
    expect(mobile.find((s) => s.name === 'xl')!.size).toBeLessThan(desktop.find((s) => s.name === 'xl')!.size)
    for (const s of desktop) expect(s.lineHeight % 4).toBe(0)
  })
})

describe('shadows', () => {
  it('draws 2xs as a 1px line and grows every other level in offset and opacity, two layers each', () => {
    const levels = generateShadows()
    expect(levels.map((l) => l.name)).toEqual(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'])
    for (let i = 2; i < levels.length; i++) {
      expect(levels[i]!.ambient!.y).toBeGreaterThan(levels[i - 1]!.ambient!.y)
      expect(levels[i]!.ambient!.alpha).toBeGreaterThanOrEqual(levels[i - 1]!.ambient!.alpha)
    }
    expect(shadowCss(levels[0]!, { r: 0, g: 0, b: 0 })).toBe('0 1px 0px #0000000d')
    expect(shadowCss(levels[3]!, { r: 0, g: 0, b: 0 }).split(', ')).toHaveLength(2)
  })

  it('emits translucent layer colors and composites per mode (ADR 0010)', () => {
    const theme = generateTheme(DEFAULT_SEEDS)
    const light = generateModeShadows(theme.light)
    const dark = generateModeShadows(theme.dark)
    expect(Object.keys(light.colors)).toHaveLength(13)
    expect(Object.keys(light.composite)).toEqual(['2xs', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((l) => `shadow/${l}`))
    for (const t of Object.values(light.colors)) expect(hexToRgba(t.value).a).toBeLessThan(1)
    // Same geometry, heavier color in dark mode.
    expect(hexToRgba(dark.colors['shadow/md/ambient']!.value).a).toBeGreaterThan(
      hexToRgba(light.colors['shadow/md/ambient']!.value).a,
    )
  })
})

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
