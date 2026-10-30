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
  perceivedLightness,
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
import { toneFor } from './curve'
import { validateMode } from './validate'

/** Contrast margin over every target, so 8-bit rounding of the output never drops below it. */
const CONTRAST_MARGIN = 0.05
/** Every lightness step is measured on 8-bit colors; this nudges until the step holds. */
const NUDGE = 0.002
const WHITE: Rgb = { r: 1, g: 1, b: 1 }
const BLACK: Rgb = { r: 0, g: 0, b: 0 }
/** Smallest compressed spacing between the two text prominences on mid tones (ADR 0016). */
const MIN_TEXT_SPREAD = 0.01
/** Translucent tokens must stay below 1. */
const MAX_ALPHA = 254 / 255

const rgb = (l: number, c: number, h: number) => oklchToRgb({ l, c, h })
/** The color as it will be shipped: rounded to 8 bits per channel. */
const quantize = (c: Rgb) => hexToRgba(rgbaToHex(c))
/** A color as a function of lightness: constant chroma and hue, or a family curve (prototype). */
type Tone = (l: number) => Oklch
const flat =
  (c: number, h: number): Tone =>
  (l) => ({ l, c, h })
const paint = (tone: Tone, l: number) => oklchToRgb(tone(l))
/** The tone of a family: its curve (through the seed or the brand ramp) when curves are on, else constant. */
const toneOf = (key: Oklch, p: GeneratorParams, family: string): Tone =>
  p.curve ? toneFor(family, key, p.curve) : flat(key.c, key.h)

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
  // Text sits on one side of the background (`dir`), layers move to one side of it (`layerDir`):
  // towards the text when they fit, away from it on mid tones where they would cost text contrast.
  const seeded: 1 | -1 = Math.abs(fg.l - bg.l) < 1e-3 ? (bg.l >= 0.5 ? -1 : 1) : fg.l > bg.l ? 1 : -1
  /** A build with the text on side `dir` of the background, layers on `layerDir`, raised on `raisedDir`. */
  const solve = (dir: 1 | -1, layerDir: 1 | -1, raisedDir: 1 | -1) =>
    build(mode, bg.l, dir, layerDir, raisedDir, bg, fg, accent, params)

  // The background never moves (ADR 0015): everything else adapts to it. In order, the text on its
  // seeded side, then on the other; the layers towards the text, then away from it; raised opposite
  // the layers, then on their side when there is no room beyond the background. The first build that
  // passes every rule wins; ordinary themes take the first. When none passes (mid-tone backgrounds,
  // where even the better of white and black text barely reaches 4.5:1), the one that keeps text
  // readable with the fewest other violations is kept, and the validator reports them.
  const other = -seeded as 1 | -1
  // Readability first: a contrast violation outweighs any number of step violations.
  const cost = (issues: { rule: string }[]) => issues.reduce((sum, i) => sum + (/contrast/.test(i.rule) ? 1000 : 1), 0)
  let best: { result: Build; issues: number } | undefined
  search: for (const dir of [seeded, other])
    for (const layerDir of [dir, -dir as 1 | -1])
      for (const raisedDir of [-layerDir as 1 | -1, layerDir]) {
        const result = solve(dir, layerDir, raisedDir)
        if (result.feasible) {
          best = { result, issues: 0 }
          break search
        }
        const issues = cost(validateMode({ mode, tokens: result.tokens, adjustments: [] }, params))
        if (!best || issues < best.issues) best = { result, issues }
      }
  const result = best!.result
  const moved = result.adjustments.find((a) => a.token === 'fg/neutral')
  if (moved && Math.sign(lightness(hexToRgba(moved.to)) - bg.l) !== Math.sign(fg.l - bg.l))
    moved.reason = 'text seed cannot reach 4.5:1 on its side of the background; moved to the other side'
  return { mode, tokens: result.tokens, adjustments: result.adjustments }
}

interface Build {
  tokens: Record<string, Token>
  adjustments: Adjustment[]
  feasible: boolean
}

function build(
  mode: Mode,
  l0: number,
  dir: 1 | -1,
  layerDir: 1 | -1,
  raisedDir: 1 | -1,
  bg: Oklch,
  fg: Oklch,
  accent: Oklch,
  p: GeneratorParams,
): Build {
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

  /** Screen lightness (ADR 0014): every ΔL rule is measured on it. */
  const seen = (c: Rgb) => perceivedLightness(c, p.flare)
  const shippedL = (tone: Tone, l: number) => seen(quantize(paint(tone, l)))

  /** The nearest lightness at least `step` beyond `from` in direction `d`, measured on shipped colors. */
  const nextStep = (from: number, tone: Tone, step: number, d: 1 | -1) => {
    const base = shippedL(tone, from)
    let l = from + d * step
    for (let i = 0; i < 500 && fits(l) && Math.abs(shippedL(tone, l) - base) < step; i++) l += d * NUDGE
    return l
  }
  /** Same, and a step that falls off the lightness range makes the build infeasible (drift frees room). */
  const stepped = (from: number, tone: Tone, step: number, d: 1 | -1) => {
    const l = nextStep(from, tone, step, d)
    if (!fits(l)) feasible = false
    return l
  }

  // Tone of each role: the text seed for neutral, the accent seed and the status base colors
  // (ADR 0011); constant hue and chroma, or the family's curve when curves are on.
  const statusSeed = Object.fromEntries(
    STATUS_ROLES.map((r) => [r, rgbToOklch(hexToRgba(p.statusSeeds[r]))]),
  ) as Record<StatusRole, Oklch>
  const roleTone = {
    neutral: toneOf(fg, p, 'foreground'),
    accent: toneOf(accent, p, 'accent'),
    ...Object.fromEntries(STATUS_ROLES.map((r) => [r, toneOf(statusSeed[r], p, r)])),
  } as Record<Role, Tone>
  const bgTone = toneOf(bg, p, 'neutral')
  // Tinted role backgrounds: a fixed chroma, or a share of the curve's.
  const tintTone = (r: Role): Tone => {
    const curve = p.curve
    if (!curve) return flat(p.tintChroma, roleTone[r](0.5).h)
    return (l) => {
      const on = roleTone[r](l)
      return { ...on, c: on.c * curve.tint }
    }
  }

  // A base fill with hover and pressed, each a state step further along the layers.
  const withStates = (name: string, l: number, tone: Tone, list: Rgb[]) => {
    const lh = stepped(l, tone, p.stateStep, layerDir)
    const lp = stepped(lh, tone, p.stateStep, layerDir)
    const base = paint(tone, l)
    put(name, base)
    put(`${name}/hover`, paint(tone, lh))
    put(`${name}/pressed`, paint(tone, lp))
    list.push(quantize(base), quantize(paint(tone, lh)), quantize(paint(tone, lp)))
    return quantize(base)
  }

  // 1. Neutral stack: surface → bg/neutral/subtle → bg/neutral.
  const surface = quantize(paint(bgTone, l0))
  put('surface/neutral', surface)
  const subtleL = stepped(l0, bgTone, p.layerStep, layerDir)
  const normalL = stepped(subtleL, bgTone, p.layerStep, layerDir)
  const layers: Rgb[] = [surface] // bases and states, where controls sit
  const neutralBases: Rgb[] = [surface]
  neutralBases.push(withStates('bg/neutral/subtle', subtleL, bgTone, layers))
  neutralBases.push(withStates('bg/neutral', normalL, bgTone, layers))

  // 1b. Raised (ADR 0007): translucent, on one side of every neutral layer, opposite the layers where
  //     the background leaves room and on their side where it does not (ADR 0015). Its states move
  //     along the layers like every other state. The text contrast rule counts raised as a layer.
  const awayPole = quantize(rgb(raisedDir > 0 ? 1 : 0, 0, 0))
  const layerPole = quantize(rgb(layerDir < 0 ? 0 : 1, 0, 0))
  /** Position along the layers: larger = further from the surface. */
  const tl = (l: number) => layerDir * l
  const raisedA = raisedAlpha(awayPole, neutralBases, p.raisedStep, p.flare)
  const raisedOver = neutralBases.map((B) => composite({ ...awayPole, a: raisedA ?? MAX_ALPHA }, B))
  /** Smallest layer-pole alpha a state step beyond `from` on every base, and the composites it gives. */
  const raisedState = (from: Rgb[], min: number) => {
    const a = solveAlpha(
      (a) =>
        a >= min &&
        neutralBases.every((B, i) => tl(seen(composite({ ...layerPole, a }, B))) - tl(seen(from[i]!)) >= p.stateStep),
    )
    return { a, over: neutralBases.map((B) => composite({ ...layerPole, a: a ?? MAX_ALPHA }, B)) }
  }
  const raisedHover = raisedState(raisedOver, 0)
  const raisedPressed = raisedState(raisedHover.over, raisedHover.a ?? MAX_ALPHA)
  if (raisedA === null || raisedHover.a === null || raisedPressed.a === null) feasible = false
  put('bg/neutral/raised', awayPole, raisedA ?? MAX_ALPHA)
  put('bg/neutral/raised/hover', layerPole, raisedHover.a ?? MAX_ALPHA)
  put('bg/neutral/raised/pressed', layerPole, raisedPressed.a ?? MAX_ALPHA)
  layers.push(...raisedOver, ...raisedHover.over, ...raisedPressed.over)

  // 2. Tinted role backgrounds.
  const tinted: Rgb[] = []
  for (const r of ROLES) {
    if (r === 'neutral') continue
    const tone = tintTone(r)
    const ls = stepped(l0, tone, p.layerStep, layerDir)
    withStates(`bg/${r}/subtle`, ls, tone, tinted)
    withStates(`bg/${r}`, stepped(ls, tone, p.layerStep, layerDir), tone, tinted)
  }

  // 3. Ghost fills: translucent, the only fill of transparent controls, visible on every neutral layer
  //    and on raised.
  const ghostBases = [...neutralBases, ...raisedOver]
  // Role ghosts tint towards a mid tone; when the layers move away from the text, towards the layers'
  // side instead, so a hovered ghost never costs text contrast (ADR 0015).
  const ghostL = layerDir === dir ? 0.5 : layerDir > 0 ? 0.9 : 0.1
  const ghostComposites: Rgb[] = []
  for (const r of ROLES) {
    const base = quantize(r === 'neutral' ? layerPole : paint(roleTone[r], ghostL))
    const over = (a: number, under: Rgb) => seen(composite({ ...base, a }, under))
    const hoverA = solveAlpha((a) => ghostBases.every((L) => Math.abs(over(a, L) - seen(L)) >= p.stateStep))
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
  //    beyond its floor, so it keeps its color. On mid tones the band between the floor and white or
  //    black is narrower than the step: primary text then sits at the pole and the spacing is
  //    compressed, as long as the two stay distinct (ADR 0016, after theme-contract-v1).
  const textBackgrounds = [...layers, ...tinted, ...ghostComposites]
  const worst = textBackgrounds.reduce((a, b) => (dir * (luminance(b) - luminance(a)) > 0 ? b : a))
  const fgPrimary: Partial<Record<Role, Rgb>> = {}
  for (const r of ROLES) {
    const tone = roleTone[r]
    const sub = lightnessForContrast(tone, lightness(worst), dir, worst, text)
    if (contrast(paint(tone, sub), worst) < text) feasible = false
    const minimum = nextStep(sub, tone, p.fgStep, dir)
    const target = r === 'neutral' ? fg.l : nextStep(sub, tone, Math.max(p.roleTextStep, p.fgStep), dir)
    const wanted = t(target) >= t(minimum) ? target : minimum
    const ln = Math.min(1, Math.max(0, wanted))
    if (r === 'neutral' && ln !== fg.l)
      adjust('fg/neutral', 'text seed moved to stay a step beyond the 4.5:1 floor', paint(tone, fg.l), paint(tone, ln))
    if (!fits(minimum)) {
      const spread = Math.abs(shippedL(tone, ln) - shippedL(tone, sub))
      if (spread < MIN_TEXT_SPREAD) feasible = false
      else
        adjust(
          `fg/${r}`,
          `prominence spacing compressed to ${Math.round((spread / p.fgStep) * 100)}% of fgStep: the background leaves no more room between the 4.5:1 floor and the pole (mid tone)`,
          paint(tone, sub),
          paint(tone, ln),
        )
    }
    const primary = quantize(paint(tone, ln))
    put(`fg/${r}/subtle`, paint(tone, sub))
    put(`fg/${r}`, primary)
    fgPrimary[r] = primary
  }

  // 5. Emphasized fills (ADR 0011): the fill never moves. States move away from the on-emphasized
  //    text when they fit; the text is the better of a light and a dark color, pushed towards white
  //    or black until it reaches 4.5:1 on the fill and both states (pure white or black always can).
  const onLight = quantize(rgb(0.985, Math.min(fg.c, 0.01), fg.h))
  const onDark = quantize(rgb(0.2, Math.min(fg.c, 0.02), fg.h))
  const emphasized = (r: Role, l: number, tone: Tone): Rgb => {
    const fill = quantize(paint(tone, l))
    // The side is picked by its pole, which always reaches 4.58:1 on the better side.
    const light = contrast(fill, WHITE) >= contrast(fill, BLACK)
    const away: 1 | -1 = light ? -1 : 1
    // Both states must fit on screen lightness; near black that can take far more than two steps of
    // OKLCH lightness (ADR 0014), so the side is checked by solving them, not by counting room.
    const statesOn = (d: 1 | -1) => {
      const h1 = nextStep(l, tone, p.stateStep, d)
      const p1 = nextStep(h1, tone, p.stateStep, d)
      return fits(h1) && fits(p1) ? ([h1, p1] as const) : null
    }
    const solvedStates = statesOn(away) ?? statesOn(away === 1 ? -1 : 1)
    if (!solvedStates) feasible = false
    const [lh, lp] =
      solvedStates ?? ([stepped(l, tone, p.stateStep, away), stepped(l, tone, 2 * p.stateStep, away)] as const)
    const states = [fill, quantize(paint(tone, lh)), quantize(paint(tone, lp))]
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
  const accentFill = emphasized('accent', accent.l, roleTone.accent)
  for (const r of STATUS_ROLES) emphasized(r, statusSeed[r].l, roleTone[r])
  const neutralWeight = Math.max(contrast(accentFill, surface), p.neutralWeightFloor)
  emphasized('neutral', lightnessForContrast(roleTone.neutral, l0, dir, surface, neutralWeight), roleTone.neutral)

  // 6. Focus: always the accent color, 3:1 against every layer.
  let focusL = rgbToOklch(accentFill).l
  if (layers.some((L) => contrast(paint(roleTone.accent, focusL), L) < nonText)) {
    const from = paint(roleTone.accent, focusL)
    // The furthest of the lightnesses that reach 3:1 against each layer passes all of them.
    const reach = layers.map((L) => lightnessForContrast(roleTone.accent, lightness(L), dir, L, nonText))
    focusL = reach.reduce((a, b) => (t(b) > t(a) ? b : a))
    adjust('focus/accent', 'moved to reach 3:1 against every layer', from, paint(roleTone.accent, focusL))
  }
  put('focus/accent', paint(roleTone.accent, focusL))

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
  const disabledA = raisedAlpha(ink, neutralBases, p.disabledStep, p.flare)
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

/** Smallest alpha of `pole` that moves every base by at least `step` in screen lightness, or null. */
function raisedAlpha(pole: Rgb, bases: Rgb[], step: number, flare: number): number | null {
  const seen = (c: Rgb) => perceivedLightness(c, flare)
  return solveAlpha((a) => bases.every((B) => Math.abs(seen(composite({ ...pole, a }, B)) - seen(B)) >= step))
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
