// Names and parameters of the color contract (ADR 0002, ADR 0003).

export const ROLES = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'] as const
export type Role = (typeof ROLES)[number]

export const STATUS_ROLES = ['success', 'warning', 'danger', 'info'] as const
export type StatusRole = (typeof STATUS_ROLES)[number]

export const SCOPES = ['surface', 'bg', 'fg', 'stroke', 'focus', 'blanket', 'ghost'] as const
export type Scope = (typeof SCOPES)[number]

/** Opacity is fixed by scope (ADR 0002). */
export const TRANSLUCENT_SCOPES: readonly Scope[] = ['ghost', 'stroke', 'blanket']

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
  /** Minimum ΔL between fg prominences. */
  fgStep: number
  /** WCAG contrast for text. */
  textContrast: number
  /** WCAG contrast for focus and control boundaries. */
  nonTextContrast: number
  /** Lower bound of the `emphasized` weight (contrast of emphasized fills against surface). */
  weightFloor: number
  /** Contrast of disabled text against surface (disabled is exempt from AA). */
  disabledContrast: number
  /** OKLCH chroma of tinted role backgrounds. */
  tintChroma: number
  /** OKLCH chroma of status colors. */
  statusChroma: number
  /** Fixed OKLCH hues of status colors. */
  statusHues: Record<StatusRole, number>
  /** A status hue closer than this to the accent hue is pushed away, in degrees. */
  hueConflict: number
  strokeAlpha: { subtle: number; normal: number }
  blanketAlpha: number
}

export const DEFAULT_PARAMS: GeneratorParams = {
  layerStep: 0.03,
  stateStep: 0.03,
  fgStep: 0.08,
  textContrast: 4.5,
  nonTextContrast: 3,
  weightFloor: 3,
  disabledContrast: 2,
  tintChroma: 0.03,
  statusChroma: 0.14,
  // Placeholders until the default themes' seeds are agreed.
  statusHues: { success: 150, warning: 75, danger: 27, info: 245 },
  hueConflict: 25,
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
