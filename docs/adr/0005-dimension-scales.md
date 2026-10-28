# 0005. Dimension scales

- Status: Accepted
- Date: 2026-10-28
- Supersedes: —

## Context

Spacing, sizes and radii must be shared by web and native products. Tailwind's scales are well known and battle-tested, but the system must not depend on Tailwind or any other styling framework.

## Decision

- Values are borrowed from the **Tailwind CSS v4** scales and stored as DTCG `dimension` tokens in this repository:
  - spacing on a 4px base: `0`, `px`, `0.5` … `96`;
  - radius: `xs` (2px), `sm` (4px), `md` (6px), `lg` (8px), `xl` (12px), `2xl` (16px), `3xl` (24px), `4xl` (32px), plus `none` and `full`;
  - container sizes: `3xs` (256px) … `7xl` (1280px).
- No dependency on Tailwind. Names are generated per platform, for example `spacing.4` → CSS `--spacing-4`, native `Spacing.s4`.
- px converts 1:1 to pt (iOS) and dp (Android).
- If a product adopts Tailwind later, Tailwind becomes an adapter that references these tokens, not a source.

## Alternatives considered

- **Depending on Tailwind directly** — ties every platform to a web framework.
- **An in-house scale** — no benefit over a scale designers and developers already know.

## Consequences

- Web and native share the same numbers and names.
- Changing a value is a token change and follows the versioning rules of [0001](0001-token-architecture.md).

## Open questions

- Shadows / elevation and breakpoints. (Typography: [0006](0006-typography.md).)
