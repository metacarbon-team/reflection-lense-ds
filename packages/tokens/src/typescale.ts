// Type scale (ADR 0030): Tailwind v4 steps in rem, and text roles that take a step per viewport.
// The Theme Lab edits both tables; validateTypeScale keeps the steps in order and on the grid.

import { REM_BASE } from './dimensions'

export type Viewport = 'desktop' | 'mobile'
export const VIEWPORTS: Viewport[] = ['desktop', 'mobile']
export type FontFamily = 'sans' | 'serif' | 'mono'

/** One step of the scale: `font/size/<name>` and `font/line-height/<name>`, both in rem. */
export interface TypeStep {
  name: string
  size: number
  lineHeight: number
}

/** A text role and its composite styles: `<name>` and one style per extra weight (`<name>/<weight name>`). */
export interface TextRole {
  name: string
  family: FontFamily
  weight: number
  /** Extra weights of the same role, such as `{ medium: 500, semibold: 600 }`. */
  weights?: Record<string, number>
  /** The step this role uses in each viewport. */
  step: Record<Viewport, string>
  /** Letter spacing in px per viewport; 0 when omitted. */
  tracking?: Record<Viewport, number>
  decoration?: 'underline'
  textCase?: 'uppercase'
}

export interface TypeScaleParams {
  steps: TypeStep[]
  roles: TextRole[]
}

/** A resolved composite style in one viewport. */
export interface TextStyle {
  name: string
  role: string
  family: FontFamily
  weight: number
  step: TypeStep
  /** Letter spacing in rem. */
  tracking: number
  decoration?: 'underline'
  textCase?: 'uppercase'
}

const rem = (px: number) => px / REM_BASE
const step = (name: string, size: number, lineHeight: number): TypeStep => ({
  name,
  size: rem(size),
  lineHeight: rem(lineHeight),
})
const both = (name: string) => ({ desktop: name, mobile: name })
const BODY_WEIGHTS = { medium: 500, semibold: 600 }

export const DEFAULT_TYPE_SCALE: TypeScaleParams = {
  // Tailwind v4 `--text-*` values; `2xs` and `sm` extend it, `md` is Tailwind's `sm`.
  steps: [
    step('2xs', 10, 16),
    step('xs', 12, 16),
    step('sm', 13, 20),
    step('md', 14, 20),
    step('base', 16, 24),
    step('lg', 18, 28),
    step('xl', 20, 28),
    step('2xl', 24, 32),
    step('3xl', 30, 36),
    step('4xl', 36, 40),
    step('5xl', 48, 48),
    step('6xl', 60, 60),
  ],
  // Weights and tracking as in the Figma library (ADR 0030).
  roles: [
    {
      name: 'display/large',
      family: 'serif',
      weight: 300,
      step: { desktop: '5xl', mobile: '4xl' },
      tracking: { desktop: -1, mobile: -0.8 },
    },
    {
      name: 'display',
      family: 'serif',
      weight: 300,
      step: { desktop: '4xl', mobile: '3xl' },
      tracking: { desktop: -0.4, mobile: -0.3 },
    },
    {
      name: 'heading/large',
      family: 'serif',
      weight: 400,
      step: { desktop: '3xl', mobile: '2xl' },
      tracking: { desktop: -0.3, mobile: -0.2 },
    },
    {
      name: 'heading',
      family: 'serif',
      weight: 400,
      step: { desktop: '2xl', mobile: 'xl' },
      tracking: { desktop: -0.3, mobile: -0.2 },
    },
    { name: 'heading/small', family: 'serif', weight: 400, step: both('lg') },
    {
      name: 'body/large',
      family: 'sans',
      weight: 400,
      weights: BODY_WEIGHTS,
      step: { desktop: 'lg', mobile: 'base' },
    },
    { name: 'body', family: 'sans', weight: 400, weights: BODY_WEIGHTS, step: both('base') },
    { name: 'body/small', family: 'sans', weight: 400, weights: BODY_WEIGHTS, step: both('md') },
    { name: 'body/xsmall', family: 'sans', weight: 400, weights: BODY_WEIGHTS, step: both('sm') },
    { name: 'label/large', family: 'sans', weight: 500, step: both('base') },
    { name: 'label', family: 'sans', weight: 500, step: both('md') },
    { name: 'label/small', family: 'sans', weight: 500, step: both('xs') },
    { name: 'link', family: 'sans', weight: 500, step: both('base'), decoration: 'underline' },
    { name: 'link/small', family: 'sans', weight: 500, step: both('md'), decoration: 'underline' },
    { name: 'code', family: 'mono', weight: 400, weights: { bold: 700 }, step: both('md') },
    { name: 'code/small', family: 'mono', weight: 400, weights: { bold: 700 }, step: both('xs') },
    { name: 'caption', family: 'sans', weight: 400, step: both('xs') },
    {
      name: 'caption/small',
      family: 'sans',
      weight: 400,
      step: both('2xs'),
      tracking: { desktop: 0.2, mobile: 0.2 },
    },
    {
      name: 'overline',
      family: 'sans',
      weight: 600,
      step: both('xs'),
      tracking: { desktop: 0.7, mobile: 0.7 },
      textCase: 'uppercase',
    },
  ],
}

/** Every composite style of every role, resolved for one viewport. */
export function textStyles(p: TypeScaleParams = DEFAULT_TYPE_SCALE, viewport: Viewport = 'desktop'): TextStyle[] {
  const steps = new Map(p.steps.map((s) => [s.name, s]))
  return p.roles.flatMap((role) => {
    const s = steps.get(role.step[viewport])
    if (!s) throw new Error(`Text role ${role.name} uses unknown step ${role.step[viewport]}`)
    const base = {
      role: role.name,
      family: role.family,
      step: s,
      tracking: rem(role.tracking?.[viewport] ?? 0),
      decoration: role.decoration,
      textCase: role.textCase,
    }
    return [
      { ...base, name: role.name, weight: role.weight },
      ...Object.entries(role.weights ?? {}).map(([name, weight]) => ({
        ...base,
        name: `${role.name}/${name}`,
        weight,
      })),
    ]
  })
}

const onGrid = (value: number, grid: number) => Math.abs(value / grid - Math.round(value / grid)) < 1e-6

/** Problems with an edited scale, in words; empty when the scale is valid (ADR 0030). */
export function validateTypeScale(p: TypeScaleParams): string[] {
  const issues: string[] = []
  const names = new Set<string>()
  p.steps.forEach((s, i) => {
    if (names.has(s.name)) issues.push(`Step ${s.name} is defined twice.`)
    names.add(s.name)
    if (s.size < 0.625) issues.push(`${s.name}: ${s.size}rem is below the 0.625rem (10px) minimum.`)
    if (!onGrid(s.size, 0.0625)) issues.push(`${s.name}: size ${s.size}rem is not a whole px (0.0625rem).`)
    if (!onGrid(s.lineHeight, 0.25))
      issues.push(`${s.name}: line height ${s.lineHeight}rem is off the 0.25rem (4px) grid.`)
    if (s.lineHeight < s.size) issues.push(`${s.name}: line height is smaller than the size.`)
    const prev = p.steps[i - 1]
    if (prev && s.size <= prev.size)
      issues.push(`${s.name}: ${s.size}rem must be larger than ${prev.name} (${prev.size}rem).`)
  })
  for (const role of p.roles)
    for (const viewport of VIEWPORTS)
      if (!names.has(role.step[viewport])) issues.push(`${role.name}: unknown ${viewport} step ${role.step[viewport]}.`)
  return issues
}
