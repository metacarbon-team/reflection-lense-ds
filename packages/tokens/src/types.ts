// Names and parameters of the color contract (ADR 0002, ADR 0003).

export const ROLES = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const
export type Role = (typeof ROLES)[number]

export const STATUS_ROLES = ['success', 'warning', 'danger', 'info'] as const
export type StatusRole = (typeof STATUS_ROLES)[number]

export const SCOPES = ['surface', 'bg', 'form', 'card', 'fg', 'stroke', 'focus', 'ghost'] as const
export type Scope = (typeof SCOPES)[number]

/** Opacity is fixed by scope (ADR 0002, 0026). */
export const TRANSLUCENT_SCOPES: readonly Scope[] = ['ghost', 'stroke', 'form']

/** Scopes that exist only in the neutral role (ADR 0026). */
export const NEUTRAL_ONLY_SCOPES: readonly Scope[] = ['form']

/** Roles with cards: neutral, and the statuses, whose lightest tint is a card (ADR 0026, 0027). */
export const CARD_ROLES: readonly string[] = ['neutral', ...STATUS_ROLES]

/**
 * The lightest tint of a colored role: `bg/accent/subtle` for accent, `card/<status>` for the status
 * roles (ADR 0027). One step further is `bg/<role>`.
 */
export const tintOf = (role: Exclude<Role, 'neutral'>) =>
  (STATUS_ROLES as readonly string[]).includes(role) ? `card/${role}` : `bg/${role}/subtle`

/** The surface group has no roles: the window canvas and the modal backdrop (ADR 0024). */
export const SURFACE = 'surface'
export const BACKDROP = 'surface/backdrop'
export const SURFACE_TOKENS: readonly string[] = [SURFACE, BACKDROP]

/** The focus ring (ADR 0025): an opaque 1px ring and a translucent halo of the same color. */
export const FOCUS = 'focus/accent'
export const FOCUS_HALO = 'focus/accent/subtle'

/** The disabled role: one set for every disabled control, `bg/`, `fg/` and `stroke/disabled` (ADR 0008). */
export const DISABLED = 'disabled'

/**
 * Translucent scopes (including `form`, ADR 0026), the disabled role (ADR 0008), the backdrop
 * (ADR 0024) and the focus halo (ADR 0025): opacity reads from the name.
 */
export const isTranslucent = (name: string) => {
  const [scope, role] = name.split('/')
  return (
    TRANSLUCENT_SCOPES.includes(scope as Scope) || name === BACKDROP || name === FOCUS_HALO || role === DISABLED
  )
}

export type Mode = 'light' | 'dark'

/** Seed hex colors for one mode. */
export interface ModeSeeds {
  bg: string
  fg: string
  accent: string
}

export interface ThemeSeeds {
  light: ModeSeeds
  dark: ModeSeeds
}

/**
 * Every number the generator and the validator rely on. Defaults are starting points to be
 * calibrated in the Theme Lab; lightness steps are OKLCH ΔL.
 */
/** Prototype: a Leonardo-style color curve per family (see curve.ts). */
export interface CurveParams {
  /** Exponent of the chroma falloff from the key color to white (1 = straight line in OKLCH). */
  lightPower: number
  /** Exponent of the chroma falloff from the key color to black. */
  darkPower: number
  /** Share of the curve's chroma that tinted role backgrounds take (1 = on the curve). */
  tint: number
  /** Hue rotation in degrees from the key color to white; the opposite towards black. */
  hueShift: number
  /**
   * `seed`: one curve through the seed, chroma falling off to white and black. `brand`: a curve
   * through every color of the family's brand ramp (Branding page) and the seed.
   */
  source: 'seed' | 'brand'
}

export interface GeneratorParams {
  /**
   * Flare (a share of white) added before measuring every ΔL rule, so steps are measured as they look
   * on a real screen, where near-black differences vanish (ADR 0014). 0 = plain OKLCH lightness.
   */
  flare: number
  /** Minimum ΔL between neighbouring layers and between bg prominences. */
  layerStep: number
  /** Minimum ΔL between a fill and its hover, and between hover and pressed. */
  stateStep: number
  /** Minimum ΔL by which `form/neutral` moves away from every neutral layer (ADR 0007, 0026). */
  formStep: number
  /** Minimum ΔL between fg prominences. */
  fgStep: number
  /** ΔL from `fg/<role>/subtle` to `fg/<role>` for accent and status roles, which have no text seed (ADR 0012). */
  roleTextStep: number
  /** WCAG contrast for text. */
  textContrast: number
  /** WCAG contrast for focus and control boundaries. */
  nonTextContrast: number
  /** Lower bound of the `bg/neutral/emphasized` weight, so the neutral solid fill stays strong (ADR 0009). */
  neutralWeightFloor: number
  /** Minimum contrast of disabled text on every layer (disabled is exempt from AA). */
  disabledContrast: number
  /** Minimum ΔL by which `bg/disabled` moves every neutral layer (ADR 0008). */
  disabledStep: number
  /** OKLCH chroma of tinted role backgrounds. */
  tintChroma: number
  /** Base colors of the status roles: their hue and chroma are kept, lightness is solved like any role. */
  statusSeeds: Record<StatusRole, string>
  strokeAlpha: { subtle: number; normal: number }
  backdropAlpha: number
  /** Alpha of the focus halo, `focus/accent/subtle` (ADR 0025). */
  focusHaloAlpha: number
  /**
   * Prototype: when set, every color takes chroma and hue from its family's curve at the lightness
   * the generator solves, instead of the constant chroma and hue of its role.
   */
  curve: CurveParams | null
}

export const DEFAULT_PARAMS: GeneratorParams = {
  flare: 0.005,
  layerStep: 0.03,
  stateStep: 0.03,
  // Most of the room above Off White (#f8f6f0 is 0.027 below white), so form fields read on it.
  formStep: 0.02,
  fgStep: 0.08,
  roleTextStep: 0.12,
  textContrast: 4.5,
  nonTextContrast: 3,
  neutralWeightFloor: 12,
  disabledContrast: 2,
  disabledStep: 0.02,
  tintChroma: 0.03,
  // Brand secondary colors: Light Green, Tangerine (warning) and Blue; danger is a red (#f54242) whose
  // brand curve is shaped like Tangerine's.
  statusSeeds: { success: '#51c35b', warning: '#f57042', danger: '#f54242', info: '#4880ff' },
  strokeAlpha: { subtle: 0.08, normal: 0.16 },
  backdropAlpha: 0.48,
  focusHaloAlpha: 0.25,
  curve: null,
}

export interface Token {
  /** Canonical name, e.g. `bg/accent/emphasized/hover`. */
  name: string
  /** `#rrggbb` or `#rrggbbaa`. */
  value: string
  opacity: 'opaque' | 'translucent'
}

/** Where the generator could not keep a seed or a target, and what it did instead (ADR 0003). */
export interface Adjustment {
  token: string
  reason: string
  from: string
  to: string
}

export interface ModeTheme {
  mode: Mode
  tokens: Record<string, Token>
  adjustments: Adjustment[]
}

export interface Theme {
  light: ModeTheme
  dark: ModeTheme
}
