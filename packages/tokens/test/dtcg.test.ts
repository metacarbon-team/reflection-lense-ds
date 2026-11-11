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
  DTCG_EXTENSION,
  dimensionCssVars,
  dimensionTokens,
  SPACING_STEPS,
  toPx,
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

type Color = { colorSpace: string; components: [number, number, number]; alpha: number }

/** A color through the palette of its document: an alias, or components by JSON Pointer `$ref`. */
function resolveColor(tokens: Record<string, DtcgToken>, value: unknown): Color {
  if (typeof value === 'string') {
    const target =
      tokens[
        value
          .slice(1, -1)
          .replaceAll('.', '/')
          .replace(/\/\$root$/, '')
      ]
    expect(target, value).toBeDefined()
    return resolveColor(tokens, target!.$value)
  }
  const v = value as { colorSpace: string; components: unknown; alpha: number }
  const pointer = (v.components as { $ref?: string }).$ref
  if (!pointer) return v as Color
  expect(pointer.startsWith('#/') && pointer.endsWith('/$value/components'), pointer).toBe(true)
  const step = tokens[pointer.slice(2, -'/$value/components'.length)]
  expect(step, pointer).toBeDefined()
  return { ...resolveColor(tokens, step!.$value), alpha: v.alpha }
}
const resolved = (tokens: Record<string, DtcgToken>, token: DtcgToken) =>
  token.$type === 'color'
    ? { ...token, $value: resolveColor(tokens, token.$value) }
    : token.$type === 'shadow'
      ? {
          ...token,
          $value: (token.$value as { color: unknown }[]).map((l) => ({ ...l, color: resolveColor(tokens, l.color) })),
        }
      : token

describe('DTCG export', () => {
  it('includes every mode without overwriting colors or duplicating shared font families', () => {
    const options = {
      shadows: { ...DEFAULT_SHADOWS, darkAlphaScale: 3 },
      typeScale: {
        ...DEFAULT_TYPE_SCALE,
        roles: DEFAULT_TYPE_SCALE.roles.map((r) =>
          r.name === 'body' ? { ...r, step: { desktop: 'lg', mobile: 'md' } } : r,
        ),
      },
    }
    const all = flatten(toDtcgAllModes(theme, options))
    for (const mode of ['light', 'dark'] as const) {
      for (const viewport of ['desktop', 'mobile'] as const) {
        const single = flatten(toDtcg(theme[mode], { ...options, viewport }))
        for (const [name, token] of Object.entries(single)) {
          const shared = /^(font|spacing|size|radius|border)\//.test(name)
          const target = shared
            ? name
            : name.startsWith('typography/')
              ? `typography/${viewport}/${name.slice(11)}`
              : name.startsWith('palette/')
                ? `palette/${mode}/${name.slice(8)}`
                : `${mode}/${name}`
          expect(all[target], target).toBeDefined()
          expect(resolved(all, all[target]!), target).toEqual(resolved(single, token))
        }
      }
    }
    expect(Object.keys(all).filter((name) => name.includes('/family/'))).toHaveLength(3)
    expect(Object.keys(all).filter((name) => /^(light|dark)\/(spacing|size|radius|border)\//.test(name))).toEqual([])
    expect(all['spacing/4']!.$value).toEqual({ value: 1, unit: 'rem' })
    expect(all['light/surface']).not.toEqual(all['dark/surface'])
    expect(all['typography/desktop/body']).not.toEqual(all['typography/mobile/body'])
    expect(Object.keys(all).filter((name) => /^(light|dark)\/(font|typography)\//.test(name))).toEqual([])
  })
  it.each(['light', 'dark'] as const)(
    'preserves every %s semantic value and alpha without token/group collisions',
    (mode) => {
      const tokens = flatten(JSON.parse(JSON.stringify(toDtcg(theme[mode]))))
      for (const source of Object.values(theme[mode].tokens)) {
        const token = tokens[source.name]!
        expect(token.$type).toBe('color')
        const value = resolveColor(tokens, token.$value)
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
    const small = tokens['shadow/2xs']!.$value as { color: unknown; offsetY: unknown }[]
    expect(small).toHaveLength(1)
    expect(small[0]!.offsetY).toEqual({ value: 1, unit: 'px' })
    expect(small[0]!.color).toBe('{shadow.2xs.contact}')
    expect(resolveColor(tokens, small[0]!.color).alpha).toBeCloseTo(0.4)
    const large = tokens['shadow/2xl']!.$value as { spread: { value: number; unit: string } }[]
    expect(large).toHaveLength(2)
    expect(large[1]!.spread.value).toBeLessThan(0)
    expect(tokens['shadow/2xl/contact']!.$type).toBe('color')
  })

  it.each(['light', 'dark'] as const)('exports the %s focus ring as a 1px ring over a 4px halo', (mode) => {
    const tokens = flatten(toDtcg(theme[mode]))
    const all = flatten(toDtcgAllModes(theme))
    const ring = tokens['focus/ring']!
    expect(ring.$type).toBe('shadow')
    const layers = ring.$value as { color: unknown; spread: { value: number }; blur: { value: number } }[]
    expect(layers.map((l) => [l.spread.value, l.blur.value])).toEqual([
      [1, 0],
      [4, 0],
    ])
    // Aliases, so a runtime theme that sets the focus colors also sets the ring.
    expect(layers.map((l) => l.color)).toEqual(['{focus.accent.$root}', '{focus.accent.subtle}'])
    expect(all[`${mode}/focus/ring`]!.$value).toMatchObject([
      { color: `{${mode}.focus.accent.$root}` },
      { color: `{${mode}.focus.accent.subtle}` },
    ])
  })

  it.each(['light', 'dark'] as const)('aliases every %s semantic color to an opaque palette step', (mode) => {
    const tokens = flatten(toDtcg(theme[mode]))
    const steps = Object.keys(tokens).filter((name) => name.startsWith('palette/'))
    expect(steps.length).toBeGreaterThan(0)
    for (const name of steps) expect((tokens[name]!.$value as Color).alpha, name).toBe(1)
    for (const source of Object.values(theme[mode].tokens)) {
      const value = tokens[source.name]!.$value
      if (hexToRgba(source.value).a === 1) expect(value, source.name).toMatch(/^\{palette\.[a-z]+\.\d+\}$/)
      else
        expect(value, source.name).toMatchObject({
          colorSpace: 'srgb',
          components: { $ref: expect.stringMatching(/^#\/palette\/[a-z]+\/\d+\/\$value\/components$/) },
          alpha: hexToRgba(source.value).a,
        })
    }
  })

  it('exports one type scale and composite styles that reference it, per viewport', () => {
    const desktop = flatten(toDtcg(theme.light, { viewport: 'desktop' }))
    const mobile = flatten(toDtcg(theme.light, { viewport: 'mobile' }))
    // Primitives: Tailwind v4 steps in rem, the same in every viewport.
    expect(desktop['font/size/lg']!.$value).toEqual({ value: 1.125, unit: 'rem' })
    expect(desktop['font/line-height/lg']!.$value).toEqual({ value: 1.75, unit: 'rem' })
    expect(desktop['font/size/sm']!.$value).toEqual({ value: 0.8125, unit: 'rem' })
    expect(mobile['font/size/lg']).toEqual(desktop['font/size/lg'])
    expect(desktop['font/family/mono']!.$value).toBe('Geist Mono')
    // Composites: a step per viewport, the line-height token in $extensions.
    const heading = desktop['typography/heading/large']!
    expect(heading.$type).toBe('typography')
    expect(heading.$value).toMatchObject({
      fontFamily: '{font.family.serif}',
      fontSize: '{font.size.3xl}',
      fontWeight: '{font.weight.normal}',
      lineHeight: 1.2,
    })
    expect(heading.$extensions![DTCG_EXTENSION]).toEqual({
      lineHeight: '{font.line-height.3xl}',
      letterSpacing: '{font.tracking.tight}',
    })
    // Tracking primitives are em numbers; the composite resolves them against its size.
    expect(desktop['font/tracking/tight']).toEqual({ $type: 'number', $value: -0.025 })
    expect(desktop['font/weight/light']).toEqual({ $type: 'fontWeight', $value: 300 })
    expect(heading.$value).toMatchObject({ letterSpacing: { value: -0.046875, unit: 'rem' } })
    expect(mobile['typography/heading/large']!.$value).toMatchObject({ fontSize: '{font.size.2xl}' })
    expect(desktop['typography/body/small/medium']!.$value).toMatchObject({
      fontSize: '{font.size.md}',
      fontWeight: '{font.weight.medium}',
    })
    expect(desktop['typography/link']!.$extensions![DTCG_EXTENSION]).toMatchObject({ textDecoration: 'underline' })
    expect(desktop['typography/overline']!.$extensions![DTCG_EXTENSION]).toMatchObject({ textTransform: 'uppercase' })
    expect(desktop['typography/display/large']!.$value).toMatchObject({
      letterSpacing: { value: -0.075, unit: 'rem' },
    })
  })
})

describe('dimension scales', () => {
  const byName = Object.fromEntries(dimensionTokens().map((token) => [token.name, token]))

  it('matches the Tailwind v4 values of the Figma Number value collection, in px', () => {
    const figma: Record<string, number> = {
      'spacing/0': 0,
      'spacing/px': 1,
      'spacing/0-5': 2,
      'spacing/1-5': 6,
      'spacing/3-5': 14,
      'spacing/4': 16,
      'spacing/4-5': 18,
      'spacing/11': 44,
      'spacing/96': 384,
      'size/4': 16,
      'size/3xs': 256,
      'size/sm': 384,
      'size/md': 448,
      'size/2xl': 672,
      'size/7xl': 1280,
      'radius/none': 0,
      'radius/xs': 2,
      'radius/md': 6,
      'radius/2xl': 16,
      'radius/4xl': 32,
      'radius/full': 9999,
      'border/width/0': 0,
      'border/width/1': 1,
      'border/width/4': 4,
    }
    for (const [name, value] of Object.entries(figma)) expect(toPx(byName[name]!.value), name).toBe(value)
    expect(SPACING_STEPS).toHaveLength(36)
    expect(Object.keys(byName).filter((name) => name.startsWith('size/'))).toHaveLength(36 + 13)
  })

  it('keeps px only where Tailwind does and mirrors every spacing step as a size', () => {
    for (const token of dimensionTokens()) {
      const inPx = token.name.endsWith('/px') || token.name === 'radius/full' || token.name.startsWith('border/')
      expect(token.value.unit, token.name).toBe(inPx ? 'px' : 'rem')
    }
    for (const step of SPACING_STEPS) {
      const key = String(step).replace('.', '-')
      expect(byName[`size/${key}`]).toEqual({
        name: `size/${key}`,
        value: byName[`spacing/${key}`]!.value,
        alias: `spacing/${key}`,
      })
    }
  })

  it('writes CSS custom properties with size steps referring to spacing', () => {
    const vars = dimensionCssVars()
    expect(vars['--spacing-4-5']).toBe('1.125rem')
    expect(vars['--spacing-px']).toBe('1px')
    expect(vars['--size-4']).toBe('var(--spacing-4)')
    expect(vars['--size-md']).toBe('28rem')
    expect(vars['--radius-md']).toBe('0.375rem')
    expect(vars['--radius-full']).toBe('9999px')
    expect(vars['--border-width-2']).toBe('2px')
  })
})
