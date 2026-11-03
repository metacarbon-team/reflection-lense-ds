# 0020. Geist Mono for monospace text

- Status: Accepted
- Date: 2026-11-03
- Supersedes: the mono font choice in [0006](0006-typography.md)

## Context

Figma uses Geist Mono. The original typography ADR and Theme Lab still named JetBrains Mono, and the app did not load a monospace font asset, leaving rendering dependent on locally installed fonts.

## Decision

- The `mono` family is **Geist Mono** for code and other monospace content, in every theme and mode.
- Theme Lab bundles the variable web font through `@fontsource-variable/geist-mono`. Its CSS family is `Geist Mono Variable`, followed by system monospace fallbacks.
- The tool's code, color values and exports, and its product preview all use this loaded family.
- Sans and serif choices and the type scale remain governed by their existing ADRs.

## Consequences

The web preview no longer requires a locally installed font to match Figma's monospace family. Other platform consumers must use Geist Mono when implementing the `mono` family.
