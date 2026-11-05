# 0021. Public exports for dimension tokens

- Status: Accepted
- Date: 2026-11-03
- Extends: [0005](0005-dimension-scales.md)
- Implemented by [0029](0029-tailwind-v4-dimensions-in-rem.md): the implementation status below is historical.

## Context

ADR 0005 defines shared spacing, size and radius scales, but `@reflection/tokens` does not yet export them. Consumers cannot use that contract directly and would have to duplicate values from documentation or Figma.

## Decision

- `@reflection/tokens` must expose all three scales through its public entry point: `spacing`, `size` (container sizes), and `radius`.
- Values and keys follow ADR 0005, including fractional spacing steps, `none` and `full` radii. This decision does not introduce new scale values.
- Keep dimension data independent of themes, React and styling frameworks. Use the DTCG dimension representation required by ADR 0005, preserving value and unit.
- Provide a CSS export for all three scales. Native adapters consume the same data with the px-to-pt/dp mapping from ADR 0005.
- Figma sync and platform exports must derive from this shared data, rather than maintaining independent copies of the scales.

## Implementation status

Pending. This ADR records the required public export contract; it does not mean the dimension data, exports or adapters already exist.

Completion requires the scales and public exports, a CSS adapter, and checks that exported keys, values and units match ADR 0005, including fractional steps and full radius.

## Consequences

Consumers will be able to use spacing, container sizes and radii from the same package as colors, shadows and the type scale, without copying values or depending on Tailwind.
