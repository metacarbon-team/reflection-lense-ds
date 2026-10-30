// Palette ramps for one mode, built around the generated tokens (prototype for the Figma Palette
// collection). Every token color is an anchor, exactly; the steps in between are interpolated along the
// family's tone, so tokens alias ramp steps (plus opacity for translucent tokens) instead of holding
// raw values. Families follow where a token's hue comes from.

import { hexToRgba, oklchToRgb, rgbaToHex, rgbToOklch, type Oklch } from './color'
import type { ModeTheme } from './types'

/** Minimum number of steps per ramp; a family with more distinct colors gets more steps. */
export const RAMP_STEPS = 15
const FIRST_STEP = 100
const STEP = 50
const WHITE = '#ffffff'
const BLACK = '#000000'

export interface RampStep {
  /** 100 is the lightest step. */
  step: number
  value: string
  kind: 'anchor' | 'endpoint' | 'fill'
  /** Tokens whose color is this step. */
  tokens: string[]
}

export interface Ramp {
  family: string
  steps: RampStep[]
  /** Fitted palettes: the largest lightness distance of a step from the shared grid. */
  drift?: number
}

export interface PaletteBinding {
  family: string
  step: number
  /** 1 for opaque tokens. */
  opacity: number
}

export interface ModePalette {
  ramps: Ramp[]
  bindings: Record<string, PaletteBinding>
  /** Fitted palettes: the lightness of each step shared by every family. */
  grid?: number[]
}

/**
 * The family a token's color belongs to. `neutral` is the tone of the background seed (canvas and
 * layers), `foreground` the tone of the text seed (text, neutral solid fill, on-emphasized text,
 * disabled, neutral strokes); accent and status roles are their own families.
 */
export function familyOf(name: string): string {
  const [scope, role, ...rest] = name.split('/')
  if (role === 'disabled' || scope === 'blanket' || rest.includes('on-emphasized')) return 'foreground'
  if (role !== 'neutral') return role!
  if (scope === 'surface' || (scope === 'bg' && !rest.includes('emphasized'))) return 'neutral'
  return 'foreground'
}

/** Hue of a family: the first chromatic anchor, so achromatic endpoints take it on interpolation. */
const hueOf = (colors: Oklch[]) => colors.find((c) => c.c > 0.005)?.h ?? 0

function interpolate(a: Oklch, b: Oklch, t: number, hue: number): string {
  const h = (x: Oklch) => (x.c > 0.005 ? x.h : hue)
  const ha = h(a)
  const d = ((h(b) - ha + 540) % 360) - 180
  return rgbaToHex(oklchToRgb({ l: a.l + (b.l - a.l) * t, c: a.c + (b.c - a.c) * t, h: ha + d * t }))
}

/** One anchor per distinct base color of each family, with the tokens that use it, plus white and black. */
function anchorsOf(theme: ModeTheme) {
  const families = new Map<string, Map<string, string[]>>()
  const opacity: Record<string, number> = {}
  for (const token of Object.values(theme.tokens)) {
    const rgba = hexToRgba(token.value)
    const color = rgbaToHex({ ...rgba, a: 1 })
    const family = familyOf(token.name)
    if (!families.has(family))
      families.set(
        family,
        new Map([
          [WHITE, []],
          [BLACK, []],
        ]),
      )
    const colors = families.get(family)!
    colors.set(color, [...(colors.get(color) ?? []), token.name])
    opacity[token.name] = rgba.a
  }
  return { families, opacity }
}

export function generatePalette(theme: ModeTheme): ModePalette {
  const { families, opacity } = anchorsOf(theme)
  const ramps: Ramp[] = []
  const bindings: Record<string, PaletteBinding> = {}
  for (const [family, colors] of families) {
    const steps: Omit<RampStep, 'step'>[] = [...colors].map(([value, tokens]) => ({
      value,
      tokens,
      kind: tokens.length ? 'anchor' : 'endpoint',
    }))
    const byLightness = () => steps.sort((a, b) => lightnessOf(b.value) - lightnessOf(a.value))
    const hue = hueOf(steps.map((s) => rgbToOklch(hexToRgba(s.value))))
    // Fill the widest gaps (in lightness) until the ramp has its minimum number of steps.
    while (steps.length < RAMP_STEPS) {
      byLightness()
      let widest = 0
      for (let i = 1; i < steps.length - 1; i++)
        if (gap(steps[i]!, steps[i + 1]!) > gap(steps[widest]!, steps[widest + 1]!)) widest = i
      const a = rgbToOklch(hexToRgba(steps[widest]!.value))
      const b = rgbToOklch(hexToRgba(steps[widest + 1]!.value))
      const value = [0.5, 0.33, 0.67].map((t) => interpolate(a, b, t, hue)).find((v) => !colors.has(v))
      if (!value) break
      colors.set(value, [])
      steps.push({ value, tokens: [], kind: 'fill' })
    }
    byLightness()
    const ramp = steps.map((s, i) => ({ ...s, step: FIRST_STEP + i * STEP }))
    ramps.push({ family, steps: ramp })
    for (const s of ramp)
      for (const name of s.tokens) bindings[name] = { family, step: s.step, opacity: opacity[name]! }
  }
  ramps.sort(byFamily)
  return { ramps, bindings }
}

interface Anchor {
  value: string
  tokens: string[]
  color: Oklch
}

/**
 * Places a family's anchors (light to dark, white first and black last) on the steps of the grid
 * nearest to them in lightness, keeping their order: dynamic programming over (anchor, step), cost the
 * squared lightness distance. Steps between two anchors follow the grid's shape between them.
 */
function fitToGrid(anchors: Anchor[], grid: number[]) {
  const m = anchors.length
  const n = grid.length
  const cost = anchors.map(() => grid.map(() => Infinity))
  const from = anchors.map(() => grid.map(() => -1))
  cost[0]![0] = (grid[0]! - anchors[0]!.color.l) ** 2
  for (let j = 1; j < m; j++)
    for (let k = j; k <= n - m + j; k++) {
      const d = (grid[k]! - anchors[j]!.color.l) ** 2
      for (let q = j - 1; q < k; q++)
        if (cost[j - 1]![q]! + d < cost[j]![k]!) {
          cost[j]![k] = cost[j - 1]![q]! + d
          from[j]![k] = q
        }
    }
  const at = new Array<number>(m)
  at[m - 1] = n - 1
  for (let j = m - 1; j > 0; j--) at[j - 1] = from[j]![at[j]!]!
  // Lightness of every step, and for fills the two anchors and the position between them.
  const steps = grid.map((_, k) => {
    const j = at.filter((s) => s <= k).length - 1
    if (at[j] === k) return { l: anchors[j]!.color.l, anchor: j, between: null }
    const a = anchors[j]!.color
    const b = anchors[j + 1]!.color
    const t = (grid[k]! - grid[at[j]!]!) / (grid[at[j + 1]!]! - grid[at[j]!]!)
    return { l: a.l + (b.l - a.l) * t, anchor: -1, between: { a, b, t } }
  })
  return steps
}

/**
 * The fixed-step alternative to {@link generatePalette}: every family has the same number of steps,
 * and a step means about the same lightness in every family. The shared lightness curve (the grid) is
 * fitted to the tokens: each family places its token colors on the nearest steps of the grid, exactly,
 * and the grid becomes the average of the families; repeated until it settles. Token colors stay
 * exact, so every rule still holds; `drift` says how far each family bends away from the grid.
 */
export function generateFixedPalette(theme: ModeTheme): ModePalette {
  const { families, opacity } = anchorsOf(theme)
  const anchors = [...families].map(([family, colors]) => ({
    family,
    anchors: [...colors]
      .map(([value, tokens]) => ({ value, tokens, color: rgbToOklch(hexToRgba(value)) }))
      .sort((a, b) => b.color.l - a.color.l),
  }))
  const n = Math.max(RAMP_STEPS, ...anchors.map((f) => f.anchors.length))
  let grid = Array.from({ length: n }, (_, i) => 1 - i / (n - 1))
  let fitted = anchors.map((f) => fitToGrid(f.anchors, grid))
  for (let round = 0; round < 50; round++) {
    const next = grid.map((_, k) => fitted.reduce((sum, steps) => sum + steps[k]!.l, 0) / fitted.length)
    const moved = Math.max(...next.map((l, k) => Math.abs(l - grid[k]!)))
    grid = next
    fitted = anchors.map((f) => fitToGrid(f.anchors, grid))
    if (moved < 1e-4) break
  }

  const ramps: Ramp[] = []
  const bindings: Record<string, PaletteBinding> = {}
  anchors.forEach(({ family, anchors }, f) => {
    const hue = hueOf(anchors.map((a) => a.color))
    const steps: RampStep[] = fitted[f]!.map((s, k) => {
      const step = FIRST_STEP + k * STEP
      if (!s.between) {
        const a = anchors[s.anchor]!
        for (const name of a.tokens) bindings[name] = { family, step, opacity: opacity[name]! }
        return { step, value: a.value, tokens: a.tokens, kind: a.tokens.length ? 'anchor' : 'endpoint' }
      }
      const { a, b, t } = s.between
      return { step, value: interpolate(a, b, t, hue), tokens: [], kind: 'fill' }
    })
    const drift = Math.max(...fitted[f]!.map((s, k) => Math.abs(s.l - grid[k]!)))
    ramps.push({ family, steps, drift })
  })
  ramps.sort(byFamily)
  return { ramps, bindings, grid }
}

/** The mode with every token resolved through its ramp step (and opacity). */
export function applyPalette(theme: ModeTheme, palette: ModePalette): ModeTheme {
  const tokens = Object.fromEntries(
    Object.values(theme.tokens).map((token) => {
      const b = palette.bindings[token.name]!
      const step = palette.ramps.find((r) => r.family === b.family)!.steps.find((s) => s.step === b.step)!
      return [token.name, { ...token, value: rgbaToHex({ ...hexToRgba(step.value), a: b.opacity }) }]
    }),
  )
  return { ...theme, tokens }
}

const FAMILY_ORDER = ['neutral', 'foreground', 'accent', 'success', 'warning', 'danger', 'info']
const byFamily = (a: Ramp, b: Ramp) => FAMILY_ORDER.indexOf(a.family) - FAMILY_ORDER.indexOf(b.family)
const lightnessOf = (hex: string) => rgbToOklch(hexToRgba(hex)).l
const gap = (a: { value: string }, b: { value: string }) => Math.abs(lightnessOf(a.value) - lightnessOf(b.value))
