// Palette ramps for one mode, built around the generated tokens (prototype for the Figma Palette
// collection). Every token color is an anchor, exactly; the steps in between are filled along the
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
  if (scope === 'surface' || (scope === 'bg' && (rest.includes('raised') || !rest.includes('emphasized'))))
    return 'neutral'
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

interface Anchor {
  value: string
  tokens: string[]
  color: Oklch
}

/**
 * Places a family's anchors (in order, the first and last on the end steps) on the steps of the grid
 * nearest to their targets (lightness by default), keeping their order: dynamic programming over
 * (anchor, step), cost the squared distance. Steps between two anchors follow the grid's shape.
 */
function fitToGrid(anchors: Anchor[], grid: number[], target = anchors.map((a) => a.color.l)) {
  const m = anchors.length
  const n = grid.length
  const cost = anchors.map(() => grid.map(() => Infinity))
  const from = anchors.map(() => grid.map(() => -1))
  cost[0]![0] = (grid[0]! - target[0]!) ** 2
  for (let j = 1; j < m; j++)
    for (let k = j; k <= n - m + j; k++) {
      const d = (grid[k]! - target[j]!) ** 2
      for (let q = j - 1; q < k; q++)
        if (cost[j - 1]![q]! + d < cost[j]![k]!) {
          cost[j]![k] = cost[j - 1]![q]! + d
          from[j]![k] = q
        }
    }
  const at = new Array<number>(m)
  at[m - 1] = n - 1
  for (let j = m - 1; j > 0; j--) at[j - 1] = from[j]![at[j]!]!
  // Target of every step, and for fills the two anchors and the position between them.
  const steps = grid.map((_, k) => {
    const j = at.filter((s) => s <= k).length - 1
    if (at[j] === k) return { l: target[j]!, anchor: j, between: null }
    const a = anchors[j]!.color
    const b = anchors[j + 1]!.color
    const t = (grid[k]! - grid[at[j]!]!) / (grid[at[j + 1]!]! - grid[at[j]!]!)
    return { l: target[j]! + (target[j + 1]! - target[j]!) * t, anchor: -1, between: { a, b, t } }
  })
  return steps
}

/**
 * Fixed steps: every family has the same number of steps,
 * and a step means about the same lightness in every family. The shared lightness curve (the grid) is
 * fitted to the tokens: each family places its token colors on the nearest steps of the grid, exactly,
 * and the grid becomes the average of the families; repeated until it settles. Token colors stay
 * exact, so every rule still holds; `drift` says how far each family bends away from the grid.
 */
export function generateFixedPalette(theme: ModeTheme, fill?: (family: string, l: number) => string): ModePalette {
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
    const steps = rampSteps(family, anchors, fitted[f]!, opacity, bindings, fill)
    const drift = Math.max(...fitted[f]!.map((s, k) => Math.abs(s.l - grid[k]!)))
    ramps.push({ family, steps, drift })
  })
  ramps.sort(byFamily)
  return { ramps, bindings, grid }
}

/**
 * Ramp steps from fitted positions: anchors keep their color and bind their tokens; fills interpolate
 * between their anchors, or come from `fill` at the step's target lightness when given.
 */
function rampSteps(
  family: string,
  anchors: Anchor[],
  fitted: ReturnType<typeof fitToGrid>,
  opacity: Record<string, number>,
  bindings: Record<string, PaletteBinding>,
  fill?: (family: string, l: number) => string,
): RampStep[] {
  const hue = hueOf(anchors.map((a) => a.color))
  return fitted.map((s, k) => {
    const step = FIRST_STEP + k * STEP
    if (!s.between) {
      const a = anchors[s.anchor]!
      for (const name of a.tokens) bindings[name] = { family, step, opacity: opacity[name]! }
      return { step, value: a.value, tokens: a.tokens, kind: a.tokens.length ? 'anchor' : 'endpoint' }
    }
    const { a, b, t } = s.between
    return { step, value: fill ? fill(family, s.l) : interpolate(a, b, t, hue), tokens: [], kind: 'fill' }
  })
}

/**
 * Role slots, from the background end of the ramp (0) to the text end (14), as in a Radix scale. Null
 * for on-emphasized text, which goes with whichever end it is closer to.
 */
function slotOf(name: string): number | null {
  const [scope, role, ...rest] = name.split('/')
  const modifiers = rest.join('/')
  if (rest.includes('on-emphasized')) return null
  if (scope === 'surface') return 1
  if (scope === 'focus') return 9
  if (scope === 'ghost') return 10
  if (scope === 'bg' && role !== 'disabled') {
    const bg: Record<string, number> = {
      subtle: 2,
      'subtle/hover': 3,
      '': 3,
      'subtle/pressed': 4,
      hover: 4,
      pressed: 5,
      emphasized: 6,
      'emphasized/hover': 7,
      'emphasized/pressed': 8,
      // Raised endpoints share white/black; their distinct opaque states use the solid-fill slots.
      'raised/emphasized': 6,
      'raised/emphasized/hover': 7,
      'raised/emphasized/pressed': 8,
    }
    return bg[modifiers] ?? null
  }
  if (scope === 'fg' && modifiers === 'subtle') return 11
  return 12 // text, strokes and disabled use the text color
}
const SLOTS = 15

/**
 * The role-ordered alternative to {@link generateFixedPalette}: a step means the same role in every
 * family and both modes, as in Radix scales, so a token always binds the same step. From the
 * background end (white in light themes, black in dark ones): surface, the four background layers,
 * the emphasized fill and its states, focus, ghost, subtle text, text, then on-emphasized text next to
 * the end it is closer to. Tokens stay exact; lightness jumps where a role's color is out of that order.
 */
export function generateRolePalette(theme: ModeTheme): ModePalette {
  const { families, opacity } = anchorsOf(theme)
  const light = rgbToOklch(hexToRgba(theme.tokens['surface/neutral']!.value)).l > 0.5
  const [bgEnd, textEnd] = light ? [WHITE, BLACK] : [BLACK, WHITE]
  const toText = (c: Oklch) => (light ? -c.l : c.l)
  const ramps: Ramp[] = []
  const bindings: Record<string, PaletteBinding> = {}
  for (const [family, colors] of families) {
    const anchors = [...colors].map(([value, tokens]) => {
      const color = rgbToOklch(hexToRgba(value))
      const near = Math.abs(color.l - (light ? 1 : 0)) < Math.abs(color.l - (light ? 0 : 1)) ? 1 : 13
      const slot =
        value === bgEnd ? 0 : value === textEnd ? SLOTS - 1 : Math.min(...tokens.map((name) => slotOf(name) ?? near))
      return { value, tokens, color, slot }
    })
    anchors.sort((a, b) => a.slot - b.slot || toText(a.color) - toText(b.color))
    const n = Math.max(RAMP_STEPS, anchors.length)
    const scale = (n - 1) / (SLOTS - 1)
    const fitted = fitToGrid(
      anchors,
      Array.from({ length: n }, (_, i) => i),
      anchors.map((a) => a.slot * scale),
    )
    ramps.push({ family, steps: rampSteps(family, anchors, fitted, opacity, bindings) })
  }
  ramps.sort(byFamily)
  return { ramps, bindings }
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
