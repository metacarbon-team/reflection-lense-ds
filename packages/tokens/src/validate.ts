// Checks a generated mode against the rules of ADR 0002 and ADR 0003. Deliberately independent of
// the generator: it only reads token names and hex values, so it can validate any theme payload.

import { composite, contrast, hexToRgba, perceivedLightness, rgbaToHex, type Rgb, type Rgba } from './color'
import {
  DEFAULT_PARAMS,
  DISABLED,
  FOCUS,
  FOCUS_HALO,
  CARD_ROLES,
  NEUTRAL_ONLY_SCOPES,
  ROLES,
  SCOPES,
  SURFACE,
  SURFACE_TOKENS,
  isTranslucent,
  tintOf,
  type GeneratorParams,
  type ModeTheme,
  type Scope,
} from './types'

export interface Issue {
  rule: string
  token: string
  against?: string
  actual: number
  required: number
}

/** Allowed values after scope/role, with their position in the grammar. */
const MODIFIERS: Record<string, number> = {
  subtle: 0,
  emphasized: 0,
  'on-emphasized': 1,
  hover: 2,
  pressed: 2,
}

const TOLERANCE = 1e-3
/** Smallest spacing between text prominences when primary text is at white or black (ADR 0016). */
const MIN_COMPRESSED_STEP = 0.01

export function validateMode(theme: ModeTheme, p: GeneratorParams = DEFAULT_PARAMS): Issue[] {
  // Every ΔL rule is measured on screen lightness (ADR 0014).
  const L = (c: Rgb | undefined) => perceivedLightness(c!, p.flare)
  const issues: Issue[] = []
  const color = new Map<string, Rgba>()
  for (const [name, token] of Object.entries(theme.tokens)) color.set(name, hexToRgba(token.value))
  const get = (name: string) => color.get(name)
  const has = (name: string) => color.has(name)
  const fail = (rule: string, token: string, actual: number, required: number, against?: string) =>
    issues.push({ rule, token, against, actual: round(actual), required })

  // Grammar and opacity classes.
  for (const [name, c] of color) {
    const [scope, role, ...rest] = name.split('/')
    const okScope = SCOPES.includes(scope as Scope)
    // The disabled role has exactly one token per scope: bg/, fg/ and stroke/disabled (ADR 0008).
    const okRole =
      (ROLES as readonly string[]).includes(role ?? '') ||
      (role === DISABLED && ['bg', 'fg', 'stroke'].includes(scope!) && rest.length === 0)
    const order = rest.map((m) => MODIFIERS[m])
    const okRest = order.every((o, i) => o !== undefined && (i === 0 || o > order[i - 1]!))
    // Text has two prominences, normal and subtle (ADR 0012).
    const okFg = scope !== 'fg' || !rest.includes('emphasized')
    // Form and card exist only in the neutral role; form has no prominence (ADR 0026).
    const statesOnly = rest.every((m) => m === 'hover' || m === 'pressed')
    const okNeutralOnly = !NEUTRAL_ONLY_SCOPES.includes(scope as Scope) || role === 'neutral'
    const okForm = scope !== 'form' || statesOnly
    // Cards: neutral in three strengths; a status card is its role's lightest tint, no prominence (ADR 0027).
    const okCard = scope !== 'card' || (CARD_ROLES.includes(role ?? '') && (role === 'neutral' || statesOnly))
    // The surface group has no roles: exactly `surface` and `surface/backdrop` (ADR 0024).
    const okGrammar =
      scope === SURFACE
        ? SURFACE_TOKENS.includes(name)
        : okScope && okRole && okRest && okFg && okNeutralOnly && okForm && okCard
    if (!okGrammar) fail('grammar', name, 0, 1)
    const translucent = isTranslucent(name)
    if (translucent ? c.a >= 1 : c.a < 1)
      fail(translucent ? 'opacity: must be translucent' : 'opacity: must be opaque', name, c.a, translucent ? 0 : 1)
  }

  // Neutral subtle shares the surface color; normal sits one layer step away (ADR 0019).
  const stack = [SURFACE, 'bg/neutral/subtle', 'bg/neutral'].filter(has)
  const surface = get(SURFACE)
  const subtle = get('bg/neutral/subtle')
  const normal = get('bg/neutral')
  const sign = surface && normal ? Math.sign(L(normal) - L(surface)) : 0
  if (surface && subtle && rgbaToHex(surface) !== rgbaToHex(subtle))
    fail('neutral subtle matches surface', 'bg/neutral/subtle', 1, 0, SURFACE)
  if (surface && normal) {
    const d = Math.abs(L(normal) - L(surface))
    if (d < p.layerStep - TOLERANCE) fail('layer separation', 'bg/neutral', d, p.layerStep, SURFACE)
  }

  // Form fields (ADR 0007, 0015, 0026): on one side of every neutral layer, the same side for all of them; its
  // states a state step each along the stack. Composites over the stack count as layers.
  const formOver = (name: string): [string, Rgb][] =>
    has(name) ? stack.map((b) => [`${name} over ${b}`, composite(get(name)!, get(b)!)]) : []
  const form = formOver('form/neutral')
  const formHover = formOver('form/neutral/hover')
  const formPressed = formOver('form/neutral/pressed')
  const formSide = form.length ? Math.sign(L(form[0]![1]) - L(get(stack[0]!))) || -sign : -sign
  form.forEach(([, c], i) => {
    const d = formSide * (L(c) - L(get(stack[i]!)))
    if (d < p.formStep - TOLERANCE) fail('form separation', 'form/neutral', d, p.formStep, stack[i])
  })
  for (const [states, from] of [
    [formHover, form],
    [formPressed, formHover],
  ] as const) {
    states.forEach(([name, c], i) => {
      const prev = from[i]
      if (!prev) return
      const d = sign * (L(c) - L(prev[1]))
      if (d < p.stateStep - TOLERANCE) fail('state separation', name, d, p.stateStep, prev[0])
    })
  }

  // Layers controls sit on (bases, states and form) and bases for ghost composites.
  const layerNames = [...color.keys()].filter((n) =>
    /^(surface|bg\/neutral(\/subtle)?(\/hover|\/pressed)?)$/.test(n),
  )
  const layers: [string, Rgb][] = [
    ...layerNames.map((n): [string, Rgb] => [n, get(n)!]),
    ...form,
    ...formHover,
    ...formPressed,
  ]
  const ghostBases: [string, Rgb][] = [...stack.map((n): [string, Rgb] => [n, get(n)!]), ...form]
  const ghostNames = [...color.keys()].filter((n) => n.startsWith('ghost/'))

  // Disabled (ADR 0008): the fill is barely visible on every neutral layer; the text reaches its
  // (non-AA) contrast on every layer, form and the disabled fill, and never reads as enabled.
  const disabledBg = get(`bg/${DISABLED}`)
  const disabledFg = get(`fg/${DISABLED}`)
  const disabledOver: [string, Rgb][] = disabledBg
    ? stack.map((b) => [`bg/${DISABLED} over ${b}`, composite(disabledBg, get(b)!)])
    : []
  disabledOver.forEach(([, c], i) => {
    const d = Math.abs(L(c) - L(get(stack[i]!)))
    if (d < p.disabledStep - TOLERANCE) fail('disabled visibility', `bg/${DISABLED}`, d, p.disabledStep, stack[i])
  })
  if (disabledFg) {
    for (const [b, under] of [...ghostBases, ...disabledOver]) {
      const r = contrast(composite(disabledFg, under), under)
      if (r < p.disabledContrast) fail('disabled text contrast', `fg/${DISABLED}`, r, p.disabledContrast, b)
      if (r >= p.textContrast) fail('disabled text reads as enabled', `fg/${DISABLED}`, r, p.textContrast, b)
    }
  }

  // Text: every fg except disabled and on-emphasized, on neutral layers, its role's tinted
  // backgrounds and every ghost fill over the neutral layers.
  for (const role of ROLES) {
    const tinted =
      role === 'neutral'
        ? []
        : [...color.keys()].filter((n) => new RegExp(`^(bg/${role}(/subtle)?|card/${role})(/hover|/pressed)?$`).test(n))
    const backgrounds: [string, Rgb][] = [...layers, ...tinted.map((n): [string, Rgb] => [n, get(n)!])]
    for (const g of ghostNames)
      for (const [b, under] of ghostBases) backgrounds.push([`${g} over ${b}`, composite(get(g)!, under)])
    for (const fgName of [`fg/${role}/subtle`, `fg/${role}`].filter(has)) {
      for (const [bgName, bg] of backgrounds) {
        const r = contrast(get(fgName)!, bg)
        if (r < p.textContrast) fail('text contrast', fgName, r, p.textContrast, bgName)
      }
    }
    // Prominence separation. Compressed spacing is allowed only where there is no room for more:
    // primary text at white or black, still distinct from subtle (ADR 0016).
    const fgSteps = [`fg/${role}/subtle`, `fg/${role}`].filter(has)
    for (let i = 1; i < fgSteps.length; i++) {
      const d = Math.abs(L(get(fgSteps[i]!)) - L(get(fgSteps[i - 1]!)))
      const atPole = ['#ffffff', '#000000'].includes(rgbaToHex({ ...get(fgSteps[i]!)!, a: 1 }))
      const required = atPole ? MIN_COMPRESSED_STEP : p.fgStep
      if (d < required - TOLERANCE) fail('fg prominence separation', fgSteps[i]!, d, required, fgSteps[i - 1])
    }
    const bgSteps = [role === 'neutral' ? 'bg/neutral/subtle' : tintOf(role), `bg/${role}`].filter(has)
    if (bgSteps.length === 2) {
      const d = Math.abs(L(get(bgSteps[1]!)) - L(get(bgSteps[0]!)))
      if (d < p.layerStep - TOLERANCE) fail('bg prominence separation', bgSteps[1]!, d, p.layerStep, bgSteps[0])
    }
    // On emphasized, in every state.
    const on = `fg/${role}/on-emphasized`
    for (const fill of [`bg/${role}/emphasized`, `bg/${role}/emphasized/hover`, `bg/${role}/emphasized/pressed`].filter(
      has,
    )) {
      const r = contrast(get(on)!, get(fill)!)
      if (r < p.textContrast) fail('on-emphasized contrast', on, r, p.textContrast, fill)
    }
    // Control boundaries.
    const boundary = `stroke/${role}/emphasized`
    if (has(boundary)) {
      for (const [n, under] of layers) {
        const r = contrast(composite(get(boundary)!, under), under)
        if (r < p.nonTextContrast) fail('boundary contrast', boundary, r, p.nonTextContrast, n)
      }
    }
  }

  // Focus.
  if (has('focus/accent')) {
    for (const [n, under] of layers) {
      const r = contrast(get('focus/accent')!, under)
      if (r < p.nonTextContrast) fail('focus contrast', 'focus/accent', r, p.nonTextContrast, n)
    }
  }
  // The halo is the ring's color, translucent (ADR 0025).
  const ring = get(FOCUS)
  const halo = get(FOCUS_HALO)
  if (ring && halo && rgbaToHex({ ...halo, a: 1 }) !== rgbaToHex({ ...ring, a: 1 }))
    fail('focus halo matches ring', FOCUS_HALO, 0, 1, FOCUS)

  // State separation of opaque fills (form states are checked on their composites above).
  for (const name of color.keys()) {
    if (isTranslucent(name) || !has(`${name}/hover`) || !has(`${name}/pressed`)) continue
    const d1 = Math.abs(L(get(`${name}/hover`)) - L(get(name)))
    const d2 = Math.abs(L(get(`${name}/pressed`)) - L(get(`${name}/hover`)))
    if (d1 < p.stateStep - TOLERANCE) fail('state separation', `${name}/hover`, d1, p.stateStep, name)
    if (d2 < p.stateStep - TOLERANCE) fail('state separation', `${name}/pressed`, d2, p.stateStep, `${name}/hover`)
  }

  // Ghost fills: visible on every neutral layer, pressed distinct from hover.
  for (const role of ROLES) {
    const hover = get(`ghost/${role}/hover`)
    const pressed = get(`ghost/${role}/pressed`)
    if (!hover || !pressed) continue
    for (const [b, under] of ghostBases) {
      const h = composite(hover, under)
      const d1 = Math.abs(L(h) - L(under))
      const d2 = Math.abs(L(composite(pressed, under)) - L(h))
      if (d1 < p.stateStep - TOLERANCE) fail('ghost visibility', `ghost/${role}/hover`, d1, p.stateStep, b)
      if (d2 < p.stateStep - TOLERANCE) fail('ghost state separation', `ghost/${role}/pressed`, d2, p.stateStep, b)
    }
  }

  return issues
}

const round = (x: number) => Math.round(x * 1000) / 1000
