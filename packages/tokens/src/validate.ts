// Checks a generated mode against the rules of ADR 0002 and ADR 0003. Deliberately independent of
// the generator: it only reads token names and hex values, so it can validate any theme payload.

import { composite, contrast, hexToRgba, lightness, type Rgb, type Rgba } from './color'
import {
  DEFAULT_PARAMS,
  ROLES,
  SCOPES,
  TRANSLUCENT_SCOPES,
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
  disabled: 2,
}

const TOLERANCE = 1e-3

export function validateMode(theme: ModeTheme, p: GeneratorParams = DEFAULT_PARAMS): Issue[] {
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
    const okRole = (ROLES as readonly string[]).includes(role ?? '')
    const order = rest.map((m) => MODIFIERS[m])
    const okRest = order.every((o, i) => o !== undefined && (i === 0 || o > order[i - 1]!))
    if (!okScope || !okRole || !okRest) fail('grammar', name, 0, 1)
    const translucent = TRANSLUCENT_SCOPES.includes(scope as Scope)
    if (translucent ? c.a >= 1 : c.a < 1)
      fail(translucent ? 'opacity: must be translucent' : 'opacity: must be opaque', name, c.a, translucent ? 0 : 1)
  }

  // Layer stack: monotonic, with a minimum step.
  const stack = ['surface/neutral', 'bg/neutral/subtle', 'bg/neutral'].filter(has)
  const sign = Math.sign(L(get(stack[1]!)) - L(get(stack[0]!)))
  for (let i = 1; i < stack.length; i++) {
    const d = sign * (L(get(stack[i]!)) - L(get(stack[i - 1]!)))
    if (d < p.layerStep - TOLERANCE) fail('layer separation', stack[i]!, d, p.layerStep, stack[i - 1])
  }

  // Layers controls sit on (bases and states) and neutral bases for ghost composites.
  const layerNames = [...color.keys()].filter((n) =>
    /^(surface\/neutral|bg\/neutral(\/subtle)?(\/hover|\/pressed)?)$/.test(n),
  )
  const ghostBases = stack
  const ghostNames = [...color.keys()].filter((n) => n.startsWith('ghost/'))

  // Text: every fg except disabled and on-emphasized, on neutral layers, its role's tinted
  // backgrounds and every ghost fill over the neutral layers.
  for (const role of ROLES) {
    const tinted =
      role === 'neutral'
        ? []
        : [...color.keys()].filter((n) => new RegExp(`^bg/${role}(/subtle)?(/hover|/pressed)?$`).test(n))
    const backgrounds: [string, Rgb][] = [...layerNames, ...tinted].map((n) => [n, get(n)!])
    for (const g of ghostNames)
      for (const b of ghostBases) backgrounds.push([`${g} over ${b}`, composite(get(g)!, get(b)!)])
    for (const fgName of [`fg/${role}/subtle`, `fg/${role}`, `fg/${role}/emphasized`].filter(has)) {
      for (const [bgName, bg] of backgrounds) {
        const r = contrast(get(fgName)!, bg)
        if (r < p.textContrast) fail('text contrast', fgName, r, p.textContrast, bgName)
      }
    }
    // Prominence separation.
    const fgSteps = [`fg/${role}/subtle`, `fg/${role}`, `fg/${role}/emphasized`].filter(has)
    for (let i = 1; i < fgSteps.length; i++) {
      const d = Math.abs(L(get(fgSteps[i]!)) - L(get(fgSteps[i - 1]!)))
      if (d < p.fgStep - TOLERANCE) fail('fg prominence separation', fgSteps[i]!, d, p.fgStep, fgSteps[i - 1])
    }
    const bgSteps = [`bg/${role}/subtle`, `bg/${role}`].filter(has)
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
      for (const n of layerNames) {
        const under = get(n)!
        const r = contrast(composite(get(boundary)!, under), under)
        if (r < p.nonTextContrast) fail('boundary contrast', boundary, r, p.nonTextContrast, n)
      }
    }
  }

  // Focus.
  if (has('focus/accent')) {
    for (const n of layerNames) {
      const r = contrast(get('focus/accent')!, get(n)!)
      if (r < p.nonTextContrast) fail('focus contrast', 'focus/accent', r, p.nonTextContrast, n)
    }
  }

  // State separation of opaque fills.
  for (const name of color.keys()) {
    if (!has(`${name}/hover`) || !has(`${name}/pressed`)) continue
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
    for (const b of ghostBases) {
      const under = get(b)!
      const h = composite(hover, under)
      const d1 = Math.abs(L(h) - L(under))
      const d2 = Math.abs(L(composite(pressed, under)) - L(h))
      if (d1 < p.stateStep - TOLERANCE) fail('ghost visibility', `ghost/${role}/hover`, d1, p.stateStep, b)
      if (d2 < p.stateStep - TOLERANCE) fail('ghost state separation', `ghost/${role}/pressed`, d2, p.stateStep, b)
    }
  }

  return issues
}

const L = (c: Rgb | undefined) => lightness(c!)
const round = (x: number) => Math.round(x * 1000) / 1000
