import { describe, expect, it } from 'vitest'
import {
  DEFAULT_SEEDS,
  generateTheme,
  hexToRgba,
  rgbaToHex,
  toDtcg,
  toDtcgAllModes,
  DEFAULT_SHADOWS,
  DEFAULT_TYPE_SCALE,
} from '../src/index'
import type { DtcgGroup, DtcgToken } from '../src/dtcg'

const theme = generateTheme(DEFAULT_SEEDS)
function flatten(group: DtcgGroup, prefix = ''): Record<string, DtcgToken> {
  return Object.fromEntries(
    Object.entries(group).flatMap(([key, value]) => {
      const path = key === '$root' ? prefix : [prefix, key].filter(Boolean).join('/')
      if ('$value' in value) {
        expect(Object.keys(value).every((key) => key.startsWith('$'))).toBe(true)
        return [[path, value as DtcgToken]]
      }
      return Object.entries(flatten(value as DtcgGroup, path))
    }),
  )
}

describe('DTCG export', () => {
  it('includes every mode without overwriting colors or duplicating shared font families', () => {
    const options = {
      shadows: { ...DEFAULT_SHADOWS, darkAlphaScale: 3 },
      typeScale: { ...DEFAULT_TYPE_SCALE, base: 20 },
    }
    const all = flatten(toDtcgAllModes(theme, options))
    for (const mode of ['light', 'dark'] as const) {
      for (const viewport of ['desktop', 'mobile'] as const) {
        const single = flatten(toDtcg(theme[mode], { ...options, viewport }))
        for (const [name, token] of Object.entries(single)) {
          const target = name.startsWith('font/family/')
            ? name
            : name.startsWith('font/')
              ? `font/${viewport}/${name.slice(5)}`
              : `${mode}/${name}`
          expect(all[target], target).toEqual(token)
        }
      }
    }
    expect(Object.keys(all).filter((name) => name.includes('/family/'))).toHaveLength(3)
    expect(all['light/surface']).not.toEqual(all['dark/surface'])
    expect(all['font/desktop/size/lg']).not.toEqual(all['font/mobile/size/lg'])
  })
  it.each(['light', 'dark'] as const)(
    'preserves every %s semantic value and alpha without token/group collisions',
    (mode) => {
      const tokens = flatten(JSON.parse(JSON.stringify(toDtcg(theme[mode]))))
      for (const source of Object.values(theme[mode].tokens)) {
        const token = tokens[source.name]!
        expect(token.$type).toBe('color')
        const value = token.$value as { colorSpace: string; components: [number, number, number]; alpha: number }
        expect(value.colorSpace).toBe('srgb')
        const [r, g, b] = value.components
        expect(hexToRgba(rgbaToHex({ r, g, b, a: value.alpha }))).toEqual(hexToRgba(source.value))
      }
      expect(tokens['bg/neutral']).toBeDefined()
      expect(tokens['bg/neutral/hover']).toBeDefined()
      expect(tokens['fg/neutral/emphasized']).toBeUndefined()
    },
  )

  it('exports layered shadows with dimensions, alpha and negative spread', () => {
    const tokens = flatten(toDtcg(theme.dark, { shadows: { ...DEFAULT_SHADOWS, hairline: 0.2, darkAlphaScale: 2 } }))
    const small = tokens['shadow/2xs']!.$value as { color: { alpha: number }; offsetY: unknown }[]
    expect(small).toHaveLength(1)
    expect(small[0]!.offsetY).toEqual({ value: 1, unit: 'px' })
    expect(small[0]!.color.alpha).toBeCloseTo(0.4)
    const large = tokens['shadow/2xl']!.$value as { spread: { value: number; unit: string } }[]
    expect(large).toHaveLength(2)
    expect(large[1]!.spread.value).toBeLessThan(0)
    expect(tokens['shadow/2xl/contact']!.$type).toBe('color')
  })

  it('uses the selected viewport and current type settings', () => {
    const typeScale = { ...DEFAULT_TYPE_SCALE, base: 20, ratio: { desktop: 1.5, mobile: 1.2 } }
    const desktop = flatten(toDtcg(theme.light, { typeScale, viewport: 'desktop' }))
    const mobile = flatten(toDtcg(theme.light, { typeScale, viewport: 'mobile' }))
    expect(desktop['font/size/lg']!.$value).toEqual({ value: 30, unit: 'px' })
    expect(mobile['font/size/lg']!.$value).toEqual({ value: 24, unit: 'px' })
    expect(desktop['font/line-height/base']!.$value).toEqual({ value: 24, unit: 'px' })
    expect(desktop['font/family/mono']!.$value).toBe('Geist Mono')
  })
})
