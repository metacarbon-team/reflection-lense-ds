// Names and parameters of the color contract (ADR 0002, ADR 0003).

export const ROLES = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const
export type Role = (typeof ROLES)[number]

export const STATUS_ROLES = ['success', 'warning', 'danger', 'info'] as const
export type StatusRole = (typeof STATUS_ROLES)[number]

export const SCOPES = ['surface', 'bg', 'fg', 'stroke', 'focus', 'blanket', 'ghost'] as const
export type Scope = (typeof SCOPES)[number]

/** Opacity is fixed by scope (ADR 0002). */
export const TRANSLUCENT_SCOPES: readonly Scope[] = ['ghost', 'stroke', 'blanket']

/** The disabled role: one set for every disabled control, `bg/`, `fg/` and `stroke/disabled` (ADR 0008). */
export const DISABLED = 'disabled'

/**
 * Translucent scopes, `bg/neutral/raised` and its states (ADR 0007) and the disabled role (ADR 0008):
 * opacity reads from the name.
 */
export const isTranslucent = (name: string) => {
  const [scope, role, ...rest] = name.split('/')
  return TRANSLUCENT_SCOPES.includes(scope as Scope) || role === DISABLED || (scope === 'bg' && rest.includes('raised'))
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
export interface GeneratorParams {
  /** Minimum ΔL between neighbouring layers and between bg prominences. */
  layerStep: number
  /** Minimum ΔL between a fill and its hover, and between hover and pressed. */
  stateStep: number
  /** Minimum ΔL by which `bg/neutral/raised` moves away from every neutral layer (ADR 0007). */
  raisedStep: number
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
  blanketAlpha: number
}

export const DEFAULT_PARAMS: GeneratorParams = {
  layerStep: 0.03,
  stateStep: 0.03,
  // Nearly all the room above the default paper (#faf8f3 is 0.021 below white), so raised reads on it.
  raisedStep: 0.02,
  fgStep: 0.08,
  roleTextStep: 0.12,
  textContrast: 4.5,
  nonTextContrast: 3,
  neutralWeightFloor: 12,
  disabledContrast: 2,
  disabledStep: 0.02,
  tintChroma: 0.03,
  // Brand swatches Light Green, Tangerine and Blue. Warning is a placeholder (the previous hue 75°,
  // chroma 0.14) until a swatch covers it.
  statusSeeds: { success: '#51c35b', warning: '#eba941', danger: '#f57042', info: '#4880ff' },
  strokeAlpha: { subtle: 0.08, normal: 0.16 },
  blanketAlpha: 0.48,
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
