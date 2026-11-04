import { describe, expect, it } from 'vitest'
import { composite, contrast, hexToRgba, oklchToRgb, rgbaToHex, rgbToOklch } from '../src/color'
import { generateMode, generateTheme } from '../src/generate'
import { DEFAULT_PARAMS, DEFAULT_SEEDS } from '../src/index'
import { BRAND_SHAPES, curveKeys, DEFAULT_CURVE, familyCurve, generateCurvePalette, toneFor } from '../src/curve'
import { applyPalette, familyOf, generateFixedPalette, generateRolePalette, RAMP_STEPS } from '../src/palette'
import { generateModeShadows, generateShadows, shadowCss } from '../src/shadow'
import { DEFAULT_TYPE_SCALE, generateTypeScale } from '../src/typescale'
import { BACKDROP, SURFACE, type ModeTheme } from '../src/types'
import { validateMode, type Issue } from '../src/validate'

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

  it('keeps every background seed and passes every rule it can, whatever the seeds (ADR 0015)', () => {
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
        const generated = generateMode(mode, seeds)
        if (generated.tokens[SURFACE]!.value !== seeds.bg)
          failures.push(`${seeds.bg} ${mode}: background moved`)
        // On mid tones the text spacing is compressed at the pole (ADR 0016) and still passes. On the
        // most saturated ones the band between the 4.5:1 floor and white or black is narrower than
        // the smallest compressed step itself: only there may the two prominences fail to separate.
        const issues = validateMode(generated).filter((i) => !atPoleWithoutRoom(generated, i))
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
      const surface = hexToRgba(mode.tokens[SURFACE]!.value)
      const over = rgbToOklch(composite(raised, surface)).l - rgbToOklch(surface).l
      expect(mode.tokens['bg/neutral/raised']!.opacity).toBe('translucent')
      expect(raised.a).toBeLessThan(1)
      expect(mode.mode === 'light' ? over : -over).toBeGreaterThan(0)
    }
    // A pure white seed leaves no room above it: the surface stays and raised goes to the layers' side.
    const white = generateMode('light', { bg: '#ffffff', fg: '#111111', accent: '#1d4ed8' })
    expect(white.tokens[SURFACE]!.value).toBe('#ffffff')
    expect(validateMode(white)).toEqual([])
    const sunk = composite(hexToRgba(white.tokens['bg/neutral/raised']!.value), hexToRgba('#ffffff'))
    expect(rgbToOklch(sunk).l).toBeLessThan(1)
  })

  it('adds opaque raised emphasized with distinct states and preserves its neutral palette family', () => {
    for (const mode of Object.values(generateTheme(DEFAULT_SEEDS))) {
      const name = 'bg/neutral/raised/emphasized'
      const normal = hexToRgba(mode.tokens['bg/neutral/raised']!.value)
      expect(mode.tokens[name]!.value).toBe(rgbaToHex({ ...normal, a: 1 }))
      const values = [name, `${name}/hover`, `${name}/pressed`].map((token) => {
        expect(mode.tokens[token]!.opacity).toBe('opaque')
        expect(familyOf(token)).toBe('neutral')
        const color = hexToRgba(mode.tokens[token]!.value)
        expect(color.a).toBe(1)
        expect(contrast(hexToRgba(mode.tokens['fg/neutral']!.value), color)).toBeGreaterThanOrEqual(4.5)
        return mode.tokens[token]!.value
      })
      expect(new Set(values).size).toBe(3)
      expect(validateMode(mode)).toEqual([])
      const broken = structuredClone(mode)
      broken.tokens[`${name}/hover`]!.value = broken.tokens[name]!.value
      expect(validateMode(broken)).toContainEqual(
        expect.objectContaining({ rule: 'state separation', token: `${name}/hover` }),
      )
      broken.tokens[name]!.value = rgbaToHex({ ...normal, a: 0.5 })
      expect(validateMode(broken)).toContainEqual(
        expect.objectContaining({ rule: 'opacity: must be opaque', token: name }),
      )
    }
  })

  it('keeps accent and status fills exactly, adapting their text instead (ADR 0011)', () => {
    const theme = generateTheme(DEFAULT_SEEDS)
    for (const mode of ['light', 'dark'] as const) {
      const tokens = theme[mode].tokens
      expect(tokens['bg/accent/emphasized']!.value).toBe(DEFAULT_SEEDS[mode].accent)
      for (const [role, seed] of Object.entries(DEFAULT_PARAMS.statusSeeds)) {
        expect(tokens[`bg/${role}/emphasized`]!.value).toBe(seed)
        const on = hexToRgba(tokens[`fg/${role}/on-emphasized`]!.value)
        expect(contrast(on, hexToRgba(seed))).toBeGreaterThanOrEqual(4.5)
      }
    }
    // A mid grey fill keeps its color too; only its text moves towards black or white.
    const grey = generateMode('light', { bg: '#ffffff', fg: '#111111', accent: '#777777' })
    expect(grey.tokens['bg/accent/emphasized']!.value).toBe('#777777')
  })

  it('keeps an accessible accent seed exactly', () => {
    const mode = generateMode('light', { bg: '#ffffff', fg: '#111111', accent: '#1d4ed8' })
    expect(mode.tokens['bg/accent/emphasized']!.value).toBe('#1d4ed8')
  })

  it('keeps the background and moves the text to the other side when it cannot reach 4.5:1', () => {
    const mode = generateMode('dark', { bg: '#1a1b1a', fg: '#000000', accent: '#cee04b' })
    expect(validateMode(mode)).toEqual([])
    const surface = rgbToOklch(hexToRgba(mode.tokens[SURFACE]!.value)).l
    expect(Math.abs(surface - rgbToOklch(hexToRgba('#1a1b1a')).l)).toBeLessThan(0.03)
    expect(rgbToOklch(hexToRgba(mode.tokens['fg/neutral']!.value)).l).toBeGreaterThan(surface)
  })

  it('compresses the text spacing on a mid tone and says so (ADR 0016)', () => {
    const mode = generateMode('light', { bg: '#847033', fg: '#1a1b1a', accent: '#cee04b' })
    expect(validateMode(mode)).toEqual([])
    expect(mode.tokens[SURFACE]!.value).toBe('#847033')
    expect(mode.tokens['fg/neutral']!.value).toBe('#ffffff')
    expect(mode.tokens['fg/neutral/subtle']!.value).not.toBe('#ffffff')
    expect(mode.adjustments.some((a) => a.token === 'fg/neutral' && a.reason.includes('compressed'))).toBe(true)
  })

  it('keeps a light pink background whichever side the text seed is on', () => {
    for (const fg of ['#f8f6f0', '#000000'])
      for (const mode of ['light', 'dark'] as const) {
        const m = generateMode(mode, { bg: '#d8c0c0', fg, accent: '#cee04b' })
        expect(validateMode(m)).toEqual([])
        expect(m.tokens[SURFACE]!.value).toBe('#d8c0c0')
      }
  })

  it('keeps a visible hierarchy on a pure black background (ADR 0014)', () => {
    const mode = generateMode('dark', { bg: '#000000', fg: '#f8f6f0', accent: '#cee04b' })
    expect(validateMode(mode)).toEqual([])
    const surface = hexToRgba(mode.tokens[SURFACE]!.value)
    // Subtle shares the black surface; normal retains one visible step under screen flare.
    expect(mode.tokens[SURFACE]!.value).toBe('#000000')
    expect(mode.tokens['bg/neutral/subtle']!.value).toBe('#000000')
    expect(contrast(hexToRgba(mode.tokens['bg/neutral']!.value), surface)).toBeGreaterThan(1.06)
  })

  it('shares surface with subtle and moves normal to the former subtle step (ADR 0019)', () => {
    const theme = generateTheme(DEFAULT_SEEDS)
    for (const mode of [theme.light, theme.dark]) {
      expect(mode.tokens['bg/neutral/subtle']!.value).toBe(mode.tokens[SURFACE]!.value)
      expect(mode.tokens['bg/neutral']!.value).toBe(mode.mode === 'light' ? '#edebe5' : '#232423')
      expect(validateMode(mode)).toEqual([])
      const broken = structuredClone(mode)
      broken.tokens['bg/neutral/subtle']!.value = mode.tokens['bg/neutral']!.value
      expect(validateMode(broken)).toContainEqual(
        expect.objectContaining({ rule: 'neutral subtle matches surface', token: 'bg/neutral/subtle' }),
      )
      broken.tokens['bg/neutral']!.value = mode.tokens[SURFACE]!.value
      expect(validateMode(broken)).toContainEqual(
        expect.objectContaining({ rule: 'layer separation', token: 'bg/neutral' }),
      )
    }
  })

  it('groups the canvas and the backdrop under surface (ADR 0024)', () => {
    const theme = generateTheme(DEFAULT_SEEDS)
    for (const mode of [theme.light, theme.dark]) {
      expect(Object.keys(mode.tokens).filter((n) => n.split('/')[0] === 'surface')).toEqual(
        expect.arrayContaining([SURFACE, BACKDROP]),
      )
      expect(mode.tokens[SURFACE]!.opacity).toBe('opaque')
      expect(mode.tokens[BACKDROP]!.opacity).toBe('translucent')
      expect(mode.tokens['surface/neutral']).toBeUndefined()
      expect(mode.tokens['blanket/neutral']).toBeUndefined()
      const renamed = structuredClone(mode)
      renamed.tokens['surface/neutral'] = { ...mode.tokens[SURFACE]!, name: 'surface/neutral' }
      renamed.tokens['blanket/neutral'] = { ...mode.tokens[BACKDROP]!, name: 'blanket/neutral' }
      const grammar = validateMode(renamed).filter((i) => i.rule === 'grammar').map((i) => i.token)
      expect(grammar).toEqual(expect.arrayContaining(['surface/neutral', 'blanket/neutral']))
    }
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
    for (const s of [...desktop, ...mobile]) expect(s.lineHeight % 4).toBe(0)
    // Default 1.25 leading stays compact for small UI text, in both modes.
    for (const scale of [desktop, mobile]) expect(scale.slice(0, 4).map((s) => s.lineHeight)).toEqual([16, 16, 16, 20])
    expect(desktop.find((s) => s.name === '2xl')!.lineHeight).toBe(40)
    expect(mobile.find((s) => s.name === 'xl')!.lineHeight).toBe(28)
    // Custom leading still rounds down when closer (21 → 20), and up on a tie (18 → 20).
    const custom = generateTypeScale({ ...DEFAULT_TYPE_SCALE, leading: { body: 1.5, heading: 1.2 } })
    expect(custom.desktop.find((s) => s.name === '14')!.lineHeight).toBe(20)
    expect(custom.desktop.find((s) => s.name === '12')!.lineHeight).toBe(20)
  })
})

describe('palette', () => {
  it('puts every token color on a ramp step exactly', () => {
    const theme = generateTheme(DEFAULT_SEEDS)
    for (const mode of [theme.light, theme.dark]) {
      // Fixed steps: the same number of steps in every family on one falling grid, tokens still exact.
      const fixed = generateFixedPalette(mode)
      for (const ramp of fixed.ramps) expect(ramp.steps).toHaveLength(RAMP_STEPS)
      for (let i = 1; i < fixed.grid!.length; i++) expect(fixed.grid![i]!).toBeLessThan(fixed.grid![i - 1]!)
      expect(applyPalette(mode, fixed).tokens).toEqual(mode.tokens)
      // Role steps: tokens still exact, and a role has the same step in every family and both modes.
      const roles = generateRolePalette(mode)
      for (const ramp of roles.ramps) expect(ramp.steps).toHaveLength(RAMP_STEPS)
      expect(applyPalette(mode, roles).tokens).toEqual(mode.tokens)
      for (const role of ['accent', 'success', 'danger', 'info'])
        expect(roles.bindings[`bg/${role}/emphasized`]!.step).toBe(roles.bindings['bg/neutral/emphasized']!.step)
      // Neutral subtle intentionally shares the surface anchor (ADR 0019), unlike tinted roles.
      expect(roles.bindings['bg/neutral/subtle']).toEqual(roles.bindings[SURFACE])
      for (const role of ['success', 'warning', 'danger', 'info'])
        expect(roles.bindings[`bg/${role}/subtle`]!.step).toBe(roles.bindings['bg/accent/subtle']!.step)
    }
  })
})

describe('curves (prototype)', () => {
  it('pass through the key color and keep every rule when the generator draws on them', () => {
    const key = rgbToOklch(hexToRgba('#cee04b'))
    expect(rgbaToHex(oklchToRgb(familyCurve(key)(key.l)))).toBe('#cee04b')
    expect(familyCurve(key)(1).c).toBe(0)
    const params = { ...DEFAULT_PARAMS, curve: DEFAULT_CURVE }
    const theme = generateTheme(DEFAULT_SEEDS, params)
    for (const mode of ['light', 'dark'] as const) {
      expect(validateMode(theme[mode], params)).toEqual([])
      expect(theme[mode].tokens['bg/accent/emphasized']!.value).toBe(DEFAULT_SEEDS[mode].accent)
      const keys = curveKeys(DEFAULT_SEEDS[mode], params)
      expect(applyPalette(theme[mode], generateCurvePalette(theme[mode], keys)).tokens).toEqual(theme[mode].tokens)
    }
    const random = mulberry32(20261030)
    const hex = () =>
      '#' +
      Math.floor(random() * 0xffffff)
        .toString(16)
        .padStart(6, '0')
    for (let i = 0; i < 40; i++)
      for (const mode of ['light', 'dark'] as const)
        for (const generated of [generateMode(mode, { bg: hex(), fg: hex(), accent: hex() }, params)])
          expect(validateMode(generated, params).filter((i) => !atPoleWithoutRoom(generated, i))).toEqual([])
  }, 120_000)
})

describe('brand curves (prototype)', () => {
  it('carry the brand shape onto the seed: exact seeds, the seed hue everywhere, every rule kept', () => {
    const curve = { ...DEFAULT_CURVE, source: 'brand' as const }
    // On its own core the accent curve keeps the brand's chroma profile.
    const neon = toneFor('accent', rgbToOklch(hexToRgba('#cee04b')), curve)
    for (const hex of BRAND_SHAPES.accent!.ramp) {
      const c = rgbToOklch(hexToRgba(hex))
      expect(neon(c.l).c).toBeCloseTo(c.c, 3)
    }
    const params = { ...DEFAULT_PARAMS, curve }
    const theme = generateTheme(DEFAULT_SEEDS, params)
    for (const mode of ['light', 'dark'] as const) {
      expect(validateMode(theme[mode], params)).toEqual([])
      expect(theme[mode].tokens[SURFACE]!.value).toBe(DEFAULT_SEEDS[mode].bg)
      expect(theme[mode].tokens['bg/accent/emphasized']!.value).toBe(DEFAULT_SEEDS[mode].accent)
    }
    // A navy background keeps its hue on every layer: brand colors never leak into other hues.
    const navy = generateMode('dark', { bg: '#1e2a45', fg: '#f8f6f0', accent: '#cee04b' }, params)
    const hue = rgbToOklch(hexToRgba('#1e2a45')).h
    for (const name of ['bg/neutral/subtle', 'bg/neutral', 'bg/neutral/hover', 'bg/neutral/pressed'])
      expect(Math.abs(rgbToOklch(hexToRgba(navy.tokens[name]!.value)).h - hue)).toBeLessThan(4)
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

/** A prominence issue where primary text already sits at white or black: no room left (ADR 0016). */
function atPoleWithoutRoom(mode: ModeTheme, issue: Issue) {
  return (
    issue.rule === 'fg prominence separation' &&
    ['#ffffff', '#000000'].includes(mode.tokens[issue.token]!.value.slice(0, 7))
  )
}
