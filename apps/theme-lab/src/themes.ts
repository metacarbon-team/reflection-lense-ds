// Themes the Lab can switch between: built-in presets (the modes of the Figma Core collection) and
// themes saved in this browser. A theme is the full set of generator settings.

import {
  DEFAULT_PARAMS,
  DEFAULT_SEEDS,
  DEFAULT_SHADOWS,
  DEFAULT_TYPE_SCALE,
  type GeneratorParams,
  type ShadowParams,
  type ThemeSeeds,
  type TypeScaleParams,
} from '@reflection/tokens'

export interface ThemeSettings {
  seeds: ThemeSeeds
  params: GeneratorParams
  typeScale: TypeScaleParams
  shadows: ShadowParams
}

export interface SavedTheme {
  id: string
  name: string
  /** Built-in themes are read-only: changes are saved as a new theme. */
  builtIn?: boolean
  settings: ThemeSettings
}

const defaults = (seeds: ThemeSeeds): ThemeSettings =>
  structuredClone({ seeds, params: DEFAULT_PARAMS, typeScale: DEFAULT_TYPE_SCALE, shadows: DEFAULT_SHADOWS })

export const BUILT_IN_THEMES: SavedTheme[] = [
  { id: 'reflection', name: 'Reflection', builtIn: true, settings: defaults(DEFAULT_SEEDS as ThemeSeeds) },
  {
    // The Custom mode of the Figma Core collection, seeded from its palette (light mirrors dark).
    id: 'custom',
    name: 'Custom',
    builtIn: true,
    settings: defaults({
      light: { bg: '#d8d9e9', fg: '#171c21', accent: '#2d5ed2' },
      dark: { bg: '#171c21', fg: '#d8d9e9', accent: '#2d5ed2' },
    }),
  },
]

const STORE = 'theme-lab/themes'
const ACTIVE = 'theme-lab/active-theme'

/** Themes saved in this browser. Storage may be unavailable (private window, blocked site data). */
export function loadSavedThemes(): SavedTheme[] {
  try {
    const raw = localStorage.getItem(STORE)
    const list = raw ? (JSON.parse(raw) as SavedTheme[]) : []
    return Array.isArray(list) ? list.filter((t) => t && t.id && t.name && t.settings) : []
  } catch {
    return []
  }
}

export function storeSavedThemes(themes: SavedTheme[]): void {
  try {
    localStorage.setItem(STORE, JSON.stringify(themes.filter((t) => !t.builtIn)))
  } catch {
    // Not persisted; the themes still work for this session.
  }
}

export function loadActiveId(): string {
  try {
    return localStorage.getItem(ACTIVE) ?? BUILT_IN_THEMES[0]!.id
  } catch {
    return BUILT_IN_THEMES[0]!.id
  }
}

export function storeActiveId(id: string): void {
  try {
    localStorage.setItem(ACTIVE, id)
  } catch {
    // Not persisted.
  }
}

export const newThemeId = () => `theme-${Date.now().toString(36)}`

/** Settings saved by an older Lab may miss newer fields: fill them from the defaults. */
export function normalize(s: Partial<ThemeSettings>): ThemeSettings {
  const base = defaults(DEFAULT_SEEDS as ThemeSeeds)
  const type = s.typeScale
  return structuredClone({
    seeds: s.seeds ?? base.seeds,
    params: { ...base.params, ...s.params },
    typeScale: type?.steps && type.roles && type.tracking ? type : base.typeScale,
    shadows: { ...base.shadows, ...s.shadows },
  })
}

export const sameSettings = (a: ThemeSettings, b: ThemeSettings) => JSON.stringify(a) === JSON.stringify(b)

const HEX = /^#[0-9a-f]{6}$/i

/** Generator settings exported by the Lab, read back; missing parameters take the defaults. */
export function parseSettings(text: string): { settings: ThemeSettings } | { error: string } {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    return { error: 'This is not valid JSON.' }
  }
  const s = data as Partial<ThemeSettings> | null
  const seeds = s?.seeds
  for (const mode of ['light', 'dark'] as const)
    for (const key of ['bg', 'fg', 'accent'] as const)
      if (!HEX.test(seeds?.[mode]?.[key] ?? ''))
        return { error: `Missing or invalid seeds.${mode}.${key}: expected a #rrggbb color.` }
  return { settings: normalize(s!) }
}
