// Hybrid type scale (ADR 0006): fixed small UI sizes, a modular scale from base upward,
// Desktop and Mobile as modes with different ratios.

export interface TypeScaleParams {
  /** Body size in px; step `base` of the modular scale. */
  base: number
  ratio: { desktop: number; mobile: number }
  /** Fixed small sizes in px, named by their value. */
  fixed: number[]
  /** Modular steps above base. */
  steps: number
  /** Line-height multipliers; round to the nearest 4px grid point, with ties rounding up (ADR 0018). */
  leading: { body: number; heading: number }
}

export const DEFAULT_TYPE_SCALE: TypeScaleParams = {
  base: 16,
  ratio: { desktop: 1.25, mobile: 1.2 },
  fixed: [12, 13, 14],
  steps: 6,
  leading: { body: 1.25, heading: 1.25 },
}

export interface TypeStep {
  /** Primitive name: `font/size/<name>`. */
  name: string
  size: number
  lineHeight: number
}

const MODULAR_NAMES = ['base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl']

export function generateTypeScale(p: TypeScaleParams = DEFAULT_TYPE_SCALE): {
  desktop: TypeStep[]
  mobile: TypeStep[]
} {
  const grid = (px: number) => Math.round(px / 4) * 4
  const forRatio = (ratio: number): TypeStep[] => {
    const fixed = p.fixed.map((size) => ({ name: String(size), size, lineHeight: grid(size * p.leading.body) }))
    const modular = Array.from({ length: Math.min(p.steps, MODULAR_NAMES.length - 1) + 1 }, (_, i) => {
      const size = Math.round(p.base * ratio ** i)
      // From xl upward sizes are headings and get the tighter leading.
      const leading = i >= 2 ? p.leading.heading : p.leading.body
      return { name: MODULAR_NAMES[i]!, size, lineHeight: grid(size * leading) }
    })
    return [...fixed, ...modular]
  }
  return { desktop: forRatio(p.ratio.desktop), mobile: forRatio(p.ratio.mobile) }
}
