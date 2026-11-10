// Builds the Tailwind v4 theme from the DTCG export of Theme Lab (ADR 0032).
//
// tokens/*.tokens.json → dist/theme.css    CSS variables per mode + Tailwind namespaces + text role utilities
//                      → dist/tw-merge.js  tailwind-merge extension with the theme's custom class names
//
// Variables keep the canonical token names (`bg/accent/hover` → `--bg-accent-hover`), so runtime themes
// set the same variables. Tailwind namespaces only reference them (`@theme inline reference`).
// Semantic colors keep their palette aliases (ADR 0034): `--bg-accent: var(--palette-light-accent-650)`,
// and a translucent color mixes its step with transparent at its own alpha.

import StyleDictionary from 'style-dictionary'
import type { Dictionary, TransformedToken } from 'style-dictionary/types'

/** Desktop text steps apply from Tailwind's `md` breakpoint; below it the mobile steps (ADR 0030). */
const DESKTOP_FROM = '48rem'
const GENERIC_FAMILY: Record<string, string> = { sans: 'sans-serif', serif: 'serif', mono: 'monospace' }
const EXTENSION = 'com.reflection-lense'
const MODES = ['light', 'dark'] as const

// Color groups → Tailwind namespace and the prefix kept in the utility name.
// `bg/accent/hover` → `bg-accent-hover`, `card/neutral` → `bg-card-neutral`, `fg/neutral/subtle` → `text-neutral-subtle`.
const COLOR_NAMESPACES: Record<string, { namespace: string; keep: boolean }> = {
  bg: { namespace: 'background-color', keep: false },
  surface: { namespace: 'background-color', keep: true },
  form: { namespace: 'background-color', keep: true },
  card: { namespace: 'background-color', keep: true },
  ghost: { namespace: 'background-color', keep: true },
  fg: { namespace: 'text-color', keep: false },
  stroke: { namespace: 'border-color', keep: false },
}

interface Dimension {
  value: number
  unit: string
}
interface Color {
  colorSpace: string
  components: [number, number, number]
  alpha?: number
}
interface ShadowLayer {
  color: Color
  offsetX: Dimension
  offsetY: Dimension
  blur: Dimension
  spread: Dimension
}
interface Typography {
  fontFamily: string
  fontSize: string
  fontWeight: string
}

/** Path without the mode prefix and DTCG's `$root`. */
const segments = (token: TransformedToken, from = 0) => token.path.slice(from).filter((p) => p !== '$root')
const cssVar = (path: string[]) => `--${path.join('-')}`
/** `{font.size.base}` → `var(--font-size-base)`. */
const ref = (value: string) => `var(--${value.slice(1, -1).replaceAll('.', '-')})`

const dimension = (d: Dimension) => `${d.value}${d.unit}`
const hex2 = (n: number) =>
  Math.round(n * 255)
    .toString(16)
    .padStart(2, '0')
function color(c: Color): string {
  if (c.colorSpace !== 'srgb') throw new Error(`Unsupported color space: ${c.colorSpace}`)
  const alpha = c.alpha ?? 1
  return `#${c.components.map(hex2).join('')}${alpha < 1 ? hex2(alpha) : ''}`
}
const shadow = (layers: ShadowLayer[]) =>
  layers.map((l) => [l.offsetX, l.offsetY, l.blur, l.spread].map(dimension).join(' ') + ` ${color(l.color)}`).join(', ')

/** Alpha as a percentage for `color-mix`, exact to the 8-bit value it came from. */
const percent = (alpha: number) => `${Math.round(alpha * 1e6) / 1e4}%`

function colorValue(token: TransformedToken): string {
  const original = token.original.$value as unknown
  if (typeof original === 'string' && original.startsWith('{palette.')) return ref(original)
  const palette = (token.original.$extensions?.[EXTENSION] as { palette?: string } | undefined)?.palette
  if (palette) return `color-mix(in srgb, ${ref(palette)} ${percent((token.$value as Color).alpha ?? 1)}, transparent)`
  return color(token.$value as Color)
}

function value(token: TransformedToken): string {
  const v = token.$value as unknown
  switch (token.$type) {
    case 'color':
      return colorValue(token)
    case 'dimension':
      return dimension(v as Dimension)
    case 'shadow':
      return shadow(v as ShadowLayer[])
    case 'fontWeight':
      return String(v)
    case 'fontFamily': {
      const name = segments(token).at(-1)!
      return [`'${v as string}'`, GENERIC_FAMILY[name]].filter(Boolean).join(', ')
    }
    case 'number':
      // The only number tokens are tracking steps, in em (ADR 0031).
      if (token.path[1] !== 'tracking') throw new Error(`Unexpected number token: ${token.path.join('.')}`)
      return `${v as number}em`
    default:
      throw new Error(`Unsupported token type ${token.$type}: ${token.path.join('.')}`)
  }
}

const block = (selector: string, lines: string[], indent = '') =>
  [`${indent}${selector} {`, ...lines.map((l) => (l ? `${indent}  ${l}` : '')), `${indent}}`].join('\n')

interface TextRole {
  name: string
  mobile: Record<string, string>
  desktop: Record<string, string>
}

/** Text role utilities from the `typography/<viewport>/<style>` composites (ADR 0030). */
function textRoles(tokens: TransformedToken[]): TextRole[] {
  const roles = new Map<string, TextRole>()
  for (const token of tokens) {
    if (token.path[0] !== 'typography') continue
    const viewport = token.path[1] as 'desktop' | 'mobile'
    const name = segments(token, 2).join('-')
    const original = token.original.$value as Typography
    const extension = (token.original.$extensions?.[EXTENSION] ?? {}) as Record<string, string>
    const props: Record<string, string> = {
      'font-family': ref(original.fontFamily),
      'font-size': ref(original.fontSize),
      'line-height': ref(extension.lineHeight!),
      'font-weight': ref(original.fontWeight),
      'letter-spacing': ref(extension.letterSpacing!),
    }
    if (extension.textDecoration) props['text-decoration-line'] = extension.textDecoration
    if (extension.textTransform) props['text-transform'] = extension.textTransform
    const role = roles.get(name) ?? { name, mobile: {}, desktop: {} }
    role[viewport] = props
    roles.set(name, role)
  }
  return [...roles.values()]
}

function themeCss({ allTokens }: Dictionary, source: string): string {
  const shared = allTokens.filter((t) => !MODES.includes(t.path[0] as never) && t.path[0] !== 'typography')
  const modes = Object.fromEntries(
    MODES.map((mode) => [mode, allTokens.filter((t) => t.path[0] === mode)] as const),
  ) as Record<(typeof MODES)[number], TransformedToken[]>
  const byGroup = (group: string) => shared.filter((t) => t.path[0] === group)
  const leaf = (t: TransformedToken) => segments(t).at(-1)!

  // Tailwind namespaces, emptied first so only system values exist.
  const theme: string[] = [
    ...['color', 'font', 'font-weight', 'text', 'tracking', 'leading', 'radius', 'shadow', 'container'].map(
      (ns) => `--${ns}-*: initial;`,
    ),
    '',
    // Tailwind's spacing multiplier is spacing/1 (ADR 0029): `p-4` = 4 × 0.25rem.
    '--spacing: var(--spacing-1);',
  ]
  // Named sizes are containers; numeric sizes mirror spacing.
  for (const t of byGroup('size'))
    if (!/^(\d+(-5)?|px)$/.test(leaf(t))) theme.push(`--container-${leaf(t)}: var(${cssVar(segments(t))});`)
  for (const t of byGroup('radius')) theme.push(`--radius-${leaf(t)}: var(${cssVar(segments(t))});`)
  for (const t of byGroup('font')) {
    const [, kind, name] = segments(t)
    const v = `var(${cssVar(segments(t))})`
    if (kind === 'family') theme.push(`--font-${name}: ${v};`)
    if (kind === 'weight') theme.push(`--font-weight-${name}: ${v};`)
    if (kind === 'tracking') theme.push(`--tracking-${name}: ${v};`)
    if (kind === 'size')
      theme.push(`--text-${name}: ${v};`, `--text-${name}--line-height: var(--font-line-height-${name});`)
  }
  for (const t of modes.light) {
    const path = segments(t, 1)
    const [group, ...rest] = path
    if (t.$type === 'shadow') {
      // shadow/<level> and focus/ring
      const name = group === 'shadow' ? rest.join('-') : path.join('-')
      theme.push(`--shadow-${name}: var(${cssVar(path)});`)
      continue
    }
    const target = COLOR_NAMESPACES[group!]
    if (!target) continue
    const name = (target.keep ? path : rest).join('-')
    theme.push(`--${target.namespace}-${name}: var(${cssVar(path)});`)
  }

  const primitives = shared.map((t) => `${cssVar(segments(t))}: ${value(t)};`)
  const mode = (m: (typeof MODES)[number]) => modes[m].map((t) => `${cssVar(segments(t, 1))}: ${value(t)};`)

  const utilities = textRoles(allTokens).map((role) => {
    const lines = Object.entries(role.mobile).map(([p, v]) => `${p}: ${v};`)
    const desktop = Object.entries(role.desktop).filter(([p, v]) => role.mobile[p] !== v)
    if (desktop.length)
      lines.push(
        block(
          `@media (width >= ${DESKTOP_FROM})`,
          desktop.map(([p, v]) => `${p}: ${v};`),
        ),
      )
    return block(
      `@utility text-${role.name}`,
      lines.flatMap((l) => l.split('\n')),
    )
  })

  return [
    `/* Generated by @reflection/theme from ${source}. Do not edit: export from Theme Lab and rebuild. */`,
    `/* Usage: @import 'tailwindcss'; @import '@reflection/theme/theme.css'; */`,
    '',
    block('@theme inline reference', theme),
    '',
    block(
      '@layer theme',
      [
        block(':root', primitives),
        '',
        block(":root,\n[data-mode='light']", mode('light')),
        '',
        block("[data-mode='dark']", mode('dark')),
      ].flatMap((l) => l.split('\n')),
    ),
    '',
    ...utilities.flatMap((u) => [u, '']),
  ].join('\n')
}

function twMergeJs({ allTokens }: Dictionary): string {
  const roles = textRoles(allTokens).map((r) => r.name)
  // Shadow utility names, so `shadow-focus-ring` replaces `shadow-xs` instead of reading as a shadow color.
  const shadows = allTokens
    .filter((t) => t.path[0] === 'light' && t.$type === 'shadow')
    .map((t) => {
      const path = segments(t, 1)
      return path[0] === 'shadow' ? path.slice(1).join('-') : path.join('-')
    })
  const config = {
    extend: {
      theme: { shadow: shadows },
      classGroups: { 'text-role': [{ text: roles }] },
      conflictingClassGroups: { 'text-role': ['font-size', 'leading', 'tracking', 'font-weight', 'font-family'] },
    },
  }
  return [
    '// Generated by @reflection/theme. Do not edit.',
    '/** tailwind-merge extension for the text role utilities of the theme: `extendTailwindMerge(twMergeConfig)`. */',
    `export const twMergeConfig = ${JSON.stringify(config, null, 2)}`,
    '',
  ].join('\n')
}

const TW_MERGE_DTS = `// Generated by @reflection/theme. Do not edit.
type Conflicts = 'font-size' | 'leading' | 'tracking' | 'font-weight' | 'font-family'
export declare const twMergeConfig: {
  extend: {
    theme: { shadow: string[] }
    classGroups: { 'text-role': [{ text: string[] }] }
    conflictingClassGroups: { 'text-role': Conflicts[] }
  }
}
`

const SOURCE = 'tokens/reflection.tokens.json'

type Json = { [key: string]: unknown }
const isObject = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)

/**
 * Style Dictionary does not resolve DTCG 2025.10 JSON Pointer references. A translucent color takes its
 * components from a palette step by `$ref` (ADR 0034): resolve the pointer, and keep the step as an
 * alias in `$extensions` so the CSS can reference the palette variable.
 */
function resolvePointers(root: Json): Json {
  const at = (pointer: string): { value: unknown; path: string[] } => {
    if (!pointer.startsWith('#/')) throw new Error(`Unsupported $ref: ${pointer}`)
    const path = pointer
      .slice(2)
      .split('/')
      .map((p) => p.replaceAll('~1', '/').replaceAll('~0', '~'))
    const value = path.reduce<unknown>((node, key) => (isObject(node) ? node[key] : undefined), root)
    if (value === undefined) throw new Error(`Unresolved $ref: ${pointer}`)
    return { value, path }
  }
  const walk = (node: Json) => {
    if (!('$value' in node)) {
      for (const child of Object.values(node)) if (isObject(child)) walk(child)
      return
    }
    const v = node.$value
    if (!isObject(v)) return
    for (const [key, part] of Object.entries(v)) {
      if (!isObject(part) || !('$ref' in part)) continue
      const target = at(part.$ref as string)
      v[key] = structuredClone(target.value)
      const valueAt = target.path.indexOf('$value')
      if (node.$type === 'color' && key === 'components' && valueAt > 0) {
        const extensions = (node.$extensions ??= {}) as Json
        const own = (extensions[EXTENSION] ??= {}) as Json
        own.palette = `{${target.path.slice(0, valueAt).join('.')}}`
      }
    }
  }
  walk(root)
  return root
}

const sd = new StyleDictionary({
  source: [SOURCE],
  log: { verbosity: 'default' },
  preprocessors: ['reflection/json-pointer'],
  hooks: {
    preprocessors: {
      'reflection/json-pointer': (dictionary) => resolvePointers(dictionary as Json) as typeof dictionary,
    },
    formats: {
      'reflection/tailwind-theme': ({ dictionary }) => themeCss(dictionary, SOURCE),
      'reflection/tw-merge': ({ dictionary }) => twMergeJs(dictionary),
      'reflection/tw-merge-dts': () => TW_MERGE_DTS,
    },
  },
  platforms: {
    tailwind: {
      // Unique names keep Style Dictionary's collision check quiet; the formats build their own names.
      transforms: ['name/kebab'],
      buildPath: 'dist/',
      files: [
        { destination: 'theme.css', format: 'reflection/tailwind-theme' },
        { destination: 'tw-merge.js', format: 'reflection/tw-merge' },
        { destination: 'tw-merge.d.ts', format: 'reflection/tw-merge-dts' },
      ],
    },
  },
})

await sd.cleanAllPlatforms()
await sd.buildAllPlatforms()
