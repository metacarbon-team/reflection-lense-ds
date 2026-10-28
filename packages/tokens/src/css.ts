import type { ModeTheme } from './types'

/** Canonical token name → CSS custom property: `bg/accent/emphasized/hover` → `--bg-accent-emphasized-hover`. */
export const cssVarName = (name: string) => `--${name.replaceAll('/', '-')}`

/** CSS custom properties of one mode, ready for a `style` attribute or a stylesheet rule. */
export function toCssVars(theme: ModeTheme): Record<string, string> {
  const vars: Record<string, string> = {}
  for (const token of Object.values(theme.tokens)) vars[cssVarName(token.name)] = token.value
  return vars
}
