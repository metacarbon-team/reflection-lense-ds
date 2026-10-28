import { describe, expect, it } from 'vitest'
import { contrast, hexToRgba, oklchToRgb, rgbaToHex, rgbToOklch } from '../src/color'
import { generateMode, generateTheme } from '../src/generate'
import { PLACEHOLDER_SEEDS } from '../src/index'
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
  it('produces a valid theme from the placeholder seeds', () => {
    const theme = generateTheme(PLACEHOLDER_SEEDS)
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

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
