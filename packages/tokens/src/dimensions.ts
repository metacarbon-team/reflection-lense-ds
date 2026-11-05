// Dimension scales from Tailwind CSS v4 (ADR 0005, ADR 0029). Static data: nothing here is generated.

/** 1rem in px. Fixed: Figma and native adapters multiply rem by it (ADR 0029). */
export const REM_BASE = 16

export interface Dimension {
  value: number
  unit: 'rem' | 'px'
}

export interface DimensionToken {
  /** Canonical name, `spacing/0-5`; a decimal point is written as a dash. */
  name: string
  value: Dimension
  /** Another token this one mirrors, such as `size/4` → `spacing/4`. */
  alias?: string
}

/** Explicit spacing steps in multiples of 0.25rem; `px` is 1px. New steps are added here (ADR 0029). */
export const SPACING_STEPS = [
  'px',
  0,
  0.5,
  1,
  1.5,
  2,
  2.5,
  3,
  3.5,
  4,
  4.5,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  14,
  16,
  20,
  24,
  28,
  32,
  36,
  40,
  44,
  48,
  52,
  56,
  60,
  64,
  72,
  80,
  96,
] as const

/** Container sizes in rem (Tailwind's `--container-*`). */
export const CONTAINER_SIZES = {
  '3xs': 16,
  '2xs': 18,
  xs: 20,
  sm: 24,
  md: 28,
  lg: 32,
  xl: 36,
  '2xl': 42,
  '3xl': 48,
  '4xl': 56,
  '5xl': 64,
  '6xl': 72,
  '7xl': 80,
} as const

/** Radii in rem; `full` is in px. */
export const RADII = {
  none: 0,
  xs: 0.125,
  sm: 0.25,
  md: 0.375,
  lg: 0.5,
  xl: 0.75,
  '2xl': 1,
  '3xl': 1.5,
  '4xl': 2,
} as const

/** Border widths in px (Tailwind's `border-*`). */
export const BORDER_WIDTHS = [0, 1, 2, 4] as const

export const rem = (value: number): Dimension => ({ value, unit: 'rem' })
export const px = (value: number): Dimension => ({ value, unit: 'px' })
/** px value of a dimension, for Figma and native. */
export const toPx = (d: Dimension) => (d.unit === 'rem' ? d.value * REM_BASE : d.value)
/** CSS length, `0.375rem` or `1px`. */
export const cssLength = (d: Dimension) => `${d.value}${d.unit}`

const stepKey = (step: (typeof SPACING_STEPS)[number]) => String(step).replace('.', '-')

/** Every dimension token: spacing, size (spacing mirror and containers), radius and border width. */
export function dimensionTokens(): DimensionToken[] {
  const spacing = SPACING_STEPS.map((step) => ({
    name: `spacing/${stepKey(step)}`,
    value: step === 'px' ? px(1) : rem(step * 0.25),
  }))
  const sizeMirror = spacing.map((token) => ({
    name: token.name.replace('spacing/', 'size/'),
    value: token.value,
    alias: token.name,
  }))
  const containers = Object.entries(CONTAINER_SIZES).map(([key, value]) => ({ name: `size/${key}`, value: rem(value) }))
  const radii = [
    ...Object.entries(RADII).map(([key, value]) => ({ name: `radius/${key}`, value: rem(value) })),
    { name: 'radius/full', value: px(9999) },
  ]
  const borders = BORDER_WIDTHS.map((width) => ({ name: `border/width/${width}`, value: px(width) }))
  return [...spacing, ...sizeMirror, ...containers, ...radii, ...borders]
}
