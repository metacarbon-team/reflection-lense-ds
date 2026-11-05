import {
  generateRolePalette,
  toDtcgAllModes,
  type Theme,
  type ShadowParams,
  type TypeScaleParams,
} from '@reflection/tokens'

export function figmaPrompt(
  theme: Theme,
  shadows: ShadowParams,
  typeScale: TypeScaleParams,
  target: 'Reflection' | 'Custom',
): string {
  const palette = { light: generateRolePalette(theme.light), dark: generateRolePalette(theme.dark) }
  return `Update the current Figma design-system file using the supplied Theme Lab tokens for the ${target} theme.

Organize collections as layers, as in our Design System Scaffolder files:
- Palette: primitive color ramps.
- Core: theme mapping, with Reflection and Custom modes.
- Theme: semantic tokens, with Light and Dark modes.
- Type scale: font/size/* and font/line-height/* primitives and font families, in a collection with a single mode.
- Typography: <role>/font-size and <role>/line-height for every text role, with Desktop and Mobile modes; each aliases the role's step in that mode (ADR 0030). Text styles bind to their role's variables, and a mobile change is a change of the alias, never of a style.
- Number value: dimension primitives — spacing, size, radius and border width.

Use the Palette → Core → Theme relationship. Light/Dark and Desktop/Mobile are modes within collections, not separate collections. Let the supplied data guide the values and mappings, and choose the implementation appropriate for the file.

Units: the payload uses rem with 1rem = 16px (ADR 0029). Figma variables hold px, so multiply rem values by 16; px values stay as they are. Each size/<n> is the sizing mirror of spacing/<n>: alias it to spacing/<n> and scope it to width and height, while spacing stays scoped to gap and padding. Write code syntax as var(--spacing-4-5), var(--size-md), var(--radius-full) — a decimal point in a name is a dash.

Include colors and transparency, typography, dimensions, and shadows as effect styles. The payload contains all modes, resolved DTCG tokens, and palette ramps with token mappings. DTCG $root means the base token at its parent path.

Name Figma variables by the canonical token path. When a token is also a group (a DTCG $root), repeat its last segment in Figma (ADR 0002): bg/neutral → bg/neutral/neutral, bg/accent/emphasized → bg/accent/emphasized/emphasized, surface → surface/surface. Core routes follow the same rule under their light/ and dark/ prefixes. Code syntax always uses the canonical name (var(--bg-neutral)).

Check the result against the supplied values in each mode and summarize changes and any gaps.

PAYLOAD
${JSON.stringify({ targetCoreMode: target, rolePalette: palette, tokens: toDtcgAllModes(theme, { shadows, typeScale }) }, null, 2)}
`
}
