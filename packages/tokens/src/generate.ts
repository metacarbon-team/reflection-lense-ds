// Seeds → semantic color tokens for one theme (ADR 0003). Contrast-targeted: hue and chroma come from
// the seeds, lightness is solved until every rule holds. Accent and status fills are their seeds
// exactly (ADR 0011); the generator never rejects a theme, it shifts derived colors (and, in edge
// cases, the background and text seeds) and reports what it shifted.

import {
  composite,
  contrast,
  hexToRgba,
  lightness,
  lightnessForContrast,
  luminance,
  oklchToRgb,
  rgbaToHex,
  rgbToOklch,
  type Oklch,
  type Rgb,
} from './color'
import {
  DEFAULT_PARAMS,
  ROLES,
  STATUS_ROLES,
  isTranslucent,
  type Adjustment,
  type GeneratorParams,
  type Mode,
  type ModeSeeds,
  type ModeTheme,
  type Role,
  type StatusRole,
  type Theme,
  type ThemeSeeds,
  type Token,
} from './types'
import { validateMode } from './validate'

/** Contrast margin over every target, so 8-bit rounding of the output never drops below it. */
const CONTRAST_MARGIN = 0.05
/** Every lightness step is measured on 8-bit colors; this nudges until the step holds. */
const NUDGE = 0.002
const WHITE: Rgb = { r: 1, g: 1, b: 1 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }
/** Translucent tokens must stay below 1. */
const MAX_ALPHA = 254 / 255

const rgb = (l: number, c: number, h: number) => oklchToRgb({ l, c, h })
/** The color as it will be shipped: rounded to 8 bits per channel. */
const quantize = (c: Rgb) => hexToRgba(rgbaToHex(c))
const shippedL = (l: number, c: number, h: number) => lightness(quantize(rgb(l, c, h)))

export function generateTheme(seeds: ThemeSeeds, params: GeneratorParams = DEFAULT_PARAMS): Theme {
  return {
    light: generateMode('light', seeds.light, params),
    dark: generateMode('dark', seeds.dark, params),
  }
}

export function generateMode(mode: Mode, seeds: ModeSeeds, params: GeneratorParams = DEFAULT_PARAMS): ModeTheme {
  const bg = rgbToOklch(hexToRgba(seeds.bg))
  const fg = rgbToOklch(hexToRgba(seeds.fg))
  const accent = rgbToOklch(hexToRgba(seeds.accent))
  // Layers, text and emphasized fills move from the background towards the text color.
  const dir: 1 | -1 = Math.abs(fg.l - bg.l) < 1e-3 ? (bg.l >= 0.5 ? -1 : 1) : fg.l > bg.l ? 1 : -1
  const run = (l0: number) => build(mode, l0, dir, bg, fg, accent, params)

  // Raised needs room beyond the background, away from the text (ADR 0007). A background without
  // that room moves towards the text, and drift never takes the room back.
  const awayPole = quantize(rgb(dir < 0 ? 1 : 0, 0, 0))
  const raisedFits = (l: number) => raisedAlpha(awayPole, [quantize(rgb(l, bg.c, bg.h))], params.raisedStep) !== null
  /** Binary search between `ok(0)` and `!ok(max)`: the last passing and the first failing value. */
  const boundary = (max: number, ok: (x: number) => boolean) => {
    let lo = 0
    let hi = max
    for (let i = 0; i < 16; i++) {
      const mid = (lo + hi) / 2
      if (ok(mid)) lo = mid
      else hi = mid
    }
    return [lo, hi] as const
  }
  let l0 = bg.l
  if (!raisedFits(l0)) {
    const toText = dir > 0 ? 1 - bg.l : bg.l
    l0 = bg.l + dir * boundary(toText, (s) => !raisedFits(bg.l + dir * s))[1]
  }
  const awayRoom = dir > 0 ? l0 : 1 - l0
  const room = raisedFits(l0 - dir * awayRoom) ? awayRoom : boundary(awayRoom, (m) => raisedFits(l0 - dir * m))[0]

  let result = run(l0)
  let drifted = false
  if (!result.feasible && room > 0) {
    // The background drifts away from the text until everything fits: binary search for the
    // smallest drift that works.
    drifted = true
    let lo = 0
    let hi = room
    result = run(l0 - dir * hi)
    if (result.feasible) {
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2
        const attempt = run(l0 - dir * mid)
        if (attempt.feasible) {
          hi = mid
          result = attempt
        } else lo = mid
      }
    }
  }
  if (drifted || l0 !== bg.l) {
    const reasons = [
      l0 !== bg.l && 'background moved towards the text so bg/neutral/raised has room beyond it',
      drifted && 'background drifted so text keeps 4.5:1 and every step fits',
    ].filter(Boolean)
    result.adjustments.unshift({
      token: 'surface/neutral',
      reason: reasons.join('; '),
      from: seeds.bg,
      to: result.tokens['surface/neutral']!.value,
    })
  }
  return { mode, tokens: result.tokens, adjustments: result.adjustments }
}

interface Build {
  tokens: Record<string, Token>
  adjustments: Adjustment[]
  feasible: boolean
}

function build(mode: Mode, l0: number, dir: 1 | -1, bg: Oklch, fg: Oklch, accent: Oklch, p: GeneratorParams): Build {
  const tokens: Record<string, Token> = {}
  const adjustments: Adjustment[] = []
  let feasible = true

  const put = (name: string, c: Rgb, a = 1) => {
    tokens[name] = {
      name,
      value: rgbaToHex({ ...c, a }),
      opacity: isTranslucent(name) ? 'translucent' : 'opaque',
    }
  }
  const adjust = (token: string, reason: string, from: Rgb, to: Rgb) =>
    adjustments.push({ token, reason, from: rgbaToHex(from), to: rgbaToHex(to) })

  const fits = (l: number) => l >= 0 && l <= 1
  /** Position along the contrast axis: larger = further from the background, towards the text. */
  const t = (l: number) => dir * l
  const text = p.textContrast + CONTRAST_MARGIN
  const nonText = p.nonTextContrast + CONTRAST_MARGIN

  /** The nearest lightness at least `step` beyond `from` in direction `d`, measured on shipped colors. */
  const nextStep = (from: number, c: number, h: number, step: number, d: 1 | -1) => {
    const base = shippedL(from, c, h)
    let l = from + d * step
    for (let i = 0; i < 60 && fits(l) && Math.abs(shippedL(l, c, h) - base) < step; i++) l += d * NUDGE
    return l
  }
  /** Same, and a step that falls off the lightness range makes the build infeasible (drift frees room). */
  const stepped = (from: number, c: number, h: number, step: number, d: 1 | -1) => {
    const l = nextStep(from, c, h, step, d)
    if (!fits(l)) feasible = false
    return l
  }

  // Hue and chroma of each role; status roles take theirs from their base colors (ADR 0011).
  const statusSeed = Object.fromEntries(
    STATUS_ROLES.map((r) => [r, rgbToOklch(hexToRgba(p.statusSeeds[r]))]),
  ) as Record<StatusRole, Oklch>
  const tint: Record<Role, { c: number; h: number }> = {
    neutral: { c: fg.c, h: fg.h },
    accent: { c: accent.c, h: accent.h },
    ...statusSeed,
  }

  // A base fill with hover and pressed, each a state step further towards the text.
  const withStates = (name: string, l: number, c: number, h: number, list: Rgb[]) => {
    const lh = stepped(l, c, h, p.stateStep, dir)
    const lp = stepped(lh, c, h, p.stateStep, dir)
    const base = rgb(l, c, h)
    put(name, base)
    put(`${name}/hover`, rgb(lh, c, h))
    put(`${name}/pressed`, rgb(lp, c, h))
    list.push(quantize(base), quantize(rgb(lh, c, h)), quantize(rgb(lp, c, h)))
    return quantize(base)
  }

  // 1. Neutral stack: surface → bg/neutral/subtle → bg/neutral.
  const surface = quantize(rgb(l0, bg.c, bg.h))
  put('surface/neutral', surface)
  const subtleL = stepped(l0, bg.c, bg.h, p.layerStep, dir)
  const normalL = stepped(subtleL, bg.c, bg.h, p.layerStep, dir)
  const layers: Rgb[] = [surface] // bases and states, where controls sit
  const neutralBases: Rgb[] = [surface]
  neutralBases.push(withStates('bg/neutral/subtle', subtleL, bg.c, bg.h, layers))
  neutralBases.push(withStates('bg/neutral', normalL, bg.c, bg.h, layers))

  // 1b. Raised (ADR 0007): translucent, away from the text on every neutral layer, so it never costs
  //     text contrast. Its states move towards the text like every other state.
  const awayPole = quantize(rgb(dir < 0 ? 1 : 0, 0, 0))
  const textPole = quantize(rgb(dir < 0 ? 0 : 1, 0, 0))
  const raisedA = raisedAlpha(awayPole, neutralBases, p.raisedStep)
  const raisedOver = neutralBases.map((B) => composite({ ...awayPole, a: raisedA ?? MAX_ALPHA }, B))
  /** Smallest text-pole alpha a state step beyond `from` on every base, and the composites it gives. */
  const raisedState = (from: Rgb[], min: number) => {
    const a = solveAlpha(
      (a) =>
        a >= min &&
        neutralBases.every(
          (B, i) => t(lightness(composite({ ...textPole, a }, B))) - t(lightness(from[i]!)) >= p.stateStep,
        ),
    )
    return { a, over: neutralBases.map((B) => composite({ ...textPole, a: a ?? MAX_ALPHA }, B)) }
  }
  const raisedHover = raisedState(raisedOver, 0)
  const raisedPressed = raisedState(raisedHover.over, raisedHover.a ?? MAX_ALPHA)
  if (raisedA === null || raisedHover.a === null || raisedPressed.a === null) feasible = false
  put('bg/neutral/raised', awayPole, raisedA ?? MAX_ALPHA)
  put('bg/neutral/raised/hover', textPole, raisedHover.a ?? MAX_ALPHA)
  put('bg/neutral/raised/pressed', textPole, raisedPressed.a ?? MAX_ALPHA)
  layers.push(...raisedOver, ...raisedHover.over, ...raisedPressed.over)

  // 2. Tinted role backgrounds.
  const tinted: Rgb[] = []
  for (const r of ROLES) {
    if (r === 'neutral') continue
    const { h } = tint[r]
    const ls = stepped(l0, p.tintChroma, h, p.layerStep, dir)
    withStates(`bg/${r}/subtle`, ls, p.tintChroma, h, tinted)
    withStates(`bg/${r}`, stepped(ls, p.tintChroma, h, p.layerStep, dir), p.tintChroma, h, tinted)
  }

  // 3. Ghost fills: translucent, the only fill of transparent controls, visible on every neutral layer
  //    and on raised.
  const ghostBases = [...neutralBases, ...raisedOver]
  const ghostComposites: Rgb[] = []
  for (const r of ROLES) {
    const base = quantize(r === 'neutral' ? textPole : rgb(0.5, tint[r].c, tint[r].h))
    const over = (a: number, under: Rgb) => lightness(composite({ ...base, a }, under))
    const hoverA = solveAlpha((a) => ghostBases.every((L) => Math.abs(over(a, L) - lightness(L)) >= p.stateStep))
    const pressedA =
      hoverA === null
        ? null
        : solveAlpha(
            (a) => a >= hoverA && ghostBases.every((L) => Math.abs(over(a, L) - over(hoverA, L)) >= p.stateStep),
          )
    if (hoverA === null || pressedA === null) {
      feasible = false
      continue
    }
    put(`ghost/${r}/hover`, base, hoverA)
    put(`ghost/${r}/pressed`, base, pressedA)
    for (const L of ghostBases)
      ghostComposites.push(composite({ ...base, a: hoverA }, L), composite({ ...base, a: pressedA }, L))
  }

  // 4. Text (ADR 0012): subtle is the 4.5:1 floor on the worst background; contrast depends on
  //    luminance only, so the worst background is the one nearest the text. Neutral primary text is
  //    the seed, at least fgStep beyond its floor; every other role's primary text is roleTextStep
  //    beyond its floor, so it keeps its color.
  const textBackgrounds = [...layers, ...tinted, ...ghostComposites]
  const worst = textBackgrounds.reduce((a, b) => (dir * (luminance(b) - luminance(a)) > 0 ? b : a))
  const fgPrimary: Partial<Record<Role, Rgb>> = {}
  for (const r of ROLES) {
    const { c, h } = tint[r]
    const sub = lightnessForContrast({ c, h }, lightness(worst), dir, worst, text)
    if (contrast(rgb(sub, c, h), worst) < text) feasible = false
    const minimum = nextStep(sub, c, h, p.fgStep, dir)
    const target = r === 'neutral' ? fg.l : nextStep(sub, c, h, Math.max(p.roleTextStep, p.fgStep), dir)
    const ln = t(target) >= t(minimum) ? target : minimum
    if (r === 'neutral' && ln !== fg.l)
      adjust('fg/neutral', 'text seed moved to stay a step beyond the 4.5:1 floor', rgb(fg.l, c, h), rgb(ln, c, h))
    // Primary text falling off the lightness range makes the build infeasible; drift then frees room.
    if (!fits(ln)) feasible = false
    const primary = quantize(rgb(Math.min(1, Math.max(0, ln)), c, h))
    put(`fg/${r}/subtle`, rgb(sub, c, h))
    put(`fg/${r}`, primary)
    fgPrimary[r] = primary
  }

  // 5. Emphasized fills (ADR 0011): the fill never moves. States move away from the on-emphasized
  //    text when they fit; the text is the better of a light and a dark color, pushed towards white
  //    or black until it reaches 4.5:1 on the fill and both states (pure white or black always can).
  const onLight = quantize(rgb(0.985, Math.min(fg.c, 0.01), fg.h))
  const onDark = quantize(rgb(0.2, Math.min(fg.c, 0.02), fg.h))
  const emphasized = (r: Role, l: number, c: number, h: number): Rgb => {
    const fill = quantize(rgb(l, c, h))
    // The side is picked by its pole, which always reaches 4.58:1 on the better side.
    const light = contrast(fill, WHITE) >= contrast(fill, BLACK)
    const away: 1 | -1 = light ? -1 : 1
    const s: 1 | -1 = fits(l + away * 2.5 * p.stateStep) ? away : away === 1 ? -1 : 1
    const lh = stepped(l, c, h, p.stateStep, s)
    const lp = stepped(lh, c, h, p.stateStep, s)
    const states = [fill, quantize(rgb(lh, c, h)), quantize(rgb(lp, c, h))]
    // The state nearest the text in luminance has the least contrast with it.
    const nearest = states.reduce((a, b) => ((light ? 1 : -1) * (luminance(b) - luminance(a)) > 0 ? b : a))
    const base = rgbToOklch(light ? onLight : onDark)
    const on = quantize(rgb(lightnessForContrast(base, base.l, light ? 1 : -1, nearest, text), base.c, base.h))
    if (states.some((x) => contrast(x, on) < text)) feasible = false
    put(`bg/${r}/emphasized`, fill)
    put(`bg/${r}/emphasized/hover`, states[1]!)
    put(`bg/${r}/emphasized/pressed`, states[2]!)
    put(`fg/${r}/on-emphasized`, on)
    return fill
  }

  // Accent and status fills are their seeds. Neutral has none: it takes the larger of the accent's
  // contrast against surface and its own floor (ADR 0009), so the neutral solid fill stays strong.
  const accentFill = emphasized('accent', accent.l, accent.c, accent.h)
  for (const r of STATUS_ROLES) emphasized(r, statusSeed[r].l, statusSeed[r].c, statusSeed[r].h)
  const neutralWeight = Math.max(contrast(accentFill, surface), p.neutralWeightFloor)
  emphasized('neutral', lightnessForContrast(tint.neutral, l0, dir, surface, neutralWeight), fg.c, fg.h)

  // 6. Focus: always the accent color, 3:1 against every layer.
  let focusL = rgbToOklch(accentFill).l
  if (layers.some((L) => contrast(rgb(focusL, accent.c, accent.h), L) < nonText)) {
    const from = rgb(focusL, accent.c, accent.h)
    // The furthest of the lightnesses that reach 3:1 against each layer passes all of them.
    const reach = layers.map((L) => lightnessForContrast(accent, lightness(L), dir, L, nonText))
    focusL = reach.reduce((a, b) => (t(b) > t(a) ? b : a))
    adjust('focus/accent', 'moved to reach 3:1 against every layer', from, rgb(focusL, accent.c, accent.h))
  }
  put('focus/accent', rgb(focusL, accent.c, accent.h))

  // 7. Strokes: translucent, on the role's primary text color. Emphasized carries control
  //    boundaries and reaches 3:1 on every layer.
  for (const r of ROLES) {
    const base = fgPrimary[r]!
    put(`stroke/${r}/subtle`, base, p.strokeAlpha.subtle)
    put(`stroke/${r}`, base, p.strokeAlpha.normal)
    const a = solveAlpha((a) => layers.every((L) => contrast(composite({ ...base, a }, L), L) >= nonText))
    if (a === null) feasible = false
    put(`stroke/${r}/emphasized`, base, a ?? MAX_ALPHA)
  }

  // 8. Disabled role (ADR 0008): the neutral text color with alpha. The fill is barely visible on
  //    every neutral layer; the text reaches its (non-AA) contrast on every layer, raised and the
  //    disabled fill, and stays below the text target.
  const ink = fgPrimary.neutral!
  const disabledA = raisedAlpha(ink, neutralBases, p.disabledStep)
  if (disabledA === null) feasible = false
  put('bg/disabled', ink, disabledA ?? MAX_ALPHA)
  const disabledUnder = [
    ...neutralBases,
    ...raisedOver,
    ...neutralBases.map((B) => composite({ ...ink, a: disabledA ?? MAX_ALPHA }, B)),
  ]
  const disabledText = solveAlpha((a) =>
    disabledUnder.every((B) => contrast(composite({ ...ink, a }, B), B) >= p.disabledContrast + CONTRAST_MARGIN),
  )
  if (disabledText === null) feasible = false
  put('fg/disabled', ink, disabledText ?? MAX_ALPHA)
  put('stroke/disabled', ink, p.strokeAlpha.subtle)
  put('blanket/neutral', { r: 0, g: 0, b: 0 }, p.blanketAlpha)

  // The validator has the last word: a build only counts when the shipped colors pass every rule.
  if (feasible) feasible = validateMode({ mode, tokens, adjustments }, p).length === 0
  return { tokens, adjustments, feasible }
}

/** Smallest alpha of `pole` that moves every base by at least `step` in lightness, or null. */
function raisedAlpha(pole: Rgb, bases: Rgb[], step: number): number | null {
  return solveAlpha((a) => bases.every((B) => Math.abs(lightness(composite({ ...pole, a }, B)) - lightness(B)) >= step))
}

/** Smallest 8-bit alpha that satisfies `ok`, or null if even the maximum does not. */
function solveAlpha(ok: (a: number) => boolean): number | null {
  if (!ok(MAX_ALPHA)) return null
  let lo = 0
  let hi = MAX_ALPHA
  for (let i = 0; i < 16; i++) {
    const mid = (lo + hi) / 2
    if (ok(mid)) hi = mid
    else lo = mid
  }
  // Round up to the next 8-bit step so the hex output keeps the property.
  for (let a = Math.ceil(hi * 255) / 255; a <= MAX_ALPHA + 1e-9; a += 1 / 255) if (ok(a)) return a
  return null
}
