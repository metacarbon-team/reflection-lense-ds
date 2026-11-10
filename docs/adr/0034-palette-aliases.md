# 0034. Semantic colors alias the palette

- Status: Accepted
- Date: 2026-11-10
- Supersedes: the "Current scope" of [0022](0022-dtcg-export.md) on palette aliases
- Extends: [0013](0013-palette-ramps.md), [0023](0023-all-modes-export.md), [0032](0032-tailwind-components.md)

## Context

The generator binds every semantic color to one step of its family's ramp, with an exact opacity ([0013](0013-palette-ramps.md)), and Figma holds that link: Theme → Core → Palette, with Core storing a palette alias plus opacity. The DTCG export, `theme.css` and Theme Lab only carried resolved colors, so nothing outside Figma knew which step a token came from.

## Decision

### Export

- The export has a `palette` group: `palette/<family>/<step>` in a single-mode file, `palette/<mode>/<family>/<step>` in the all-modes document. Steps are opaque.
- An opaque semantic color is a DTCG alias of its step: `"$value": "{palette.light.accent.650}"`.
- A translucent one cannot be an alias, because an alias cannot change alpha. It takes the step's components by a DTCG 2025.10 JSON Pointer and keeps its own alpha:
  `{ "colorSpace": "srgb", "components": { "$ref": "#/palette/light/foreground/800/$value/components" }, "alpha": 0.0863 }`.
- A token is written as an alias only when resolving it gives its exact 8-bit value back; otherwise it stays resolved. With the default seeds every semantic color is an alias. Shadow colors are not bound to the palette ([0010](0010-shadow-tokens.md)) and stay resolved, as do the colors inside composite shadows.

### Theme build

- Style Dictionary 5.8 does not resolve `$ref`, so the build resolves JSON Pointers in a preprocessor and keeps the step in `$extensions.com.reflection-lense.palette`.
- `theme.css` declares every step once in `:root` (`--palette-light-accent-650`). Mode blocks reference them: `--bg-accent: var(--palette-light-accent-250)`, and a translucent color is `color-mix(in srgb, var(--palette-light-foreground-800) 8.6275%, transparent)`, which equals the step at that alpha.
- Palette variables get no Tailwind utilities: components still use semantic tokens only. Runtime themes keep setting the semantic variables.

### Theme Lab

The token catalog lists the palette and shows each color's step next to its value (`accent/650`, `foreground/800 · 8.63%`).

## Alternatives considered

- **The link in `$extensions` only, `$value` resolved** — rejected: a proprietary field, not a reference that DTCG tools follow.
- **Translucent palette steps** (a step per opacity) — rejected: the ramp would grow with every opacity, and Figma keeps opacity on the alias.
- **Keeping resolved colors and documenting the bindings separately** — rejected: two sources for the same link.

## Consequences

Consumers must support DTCG aliases and, for translucent colors, `$ref` JSON Pointers. A change of one palette step reaches every token that aliases it, in the JSON and in CSS. The resolved values, and therefore every rendered color, are unchanged.
