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
- Typography: font families and type scales, with Desktop and Mobile modes.
- Number value: dimension primitives; spacing, size and radius are not included in this export.

Use the Palette → Core → Theme relationship. Light/Dark and Desktop/Mobile are modes within collections, not separate collections. Let the supplied data guide the values and mappings, and choose the implementation appropriate for the file.

Include colors and transparency, typography, and shadows as effect styles. The payload contains all modes, resolved DTCG tokens, and palette ramps with token mappings. DTCG $root means the base token at its parent path.

Check the result against the supplied values in each mode and summarize changes and any gaps.

PAYLOAD
${JSON.stringify({ targetCoreMode: target, rolePalette: palette, tokens: toDtcgAllModes(theme, { shadows, typeScale }) }, null, 2)}
`
}
