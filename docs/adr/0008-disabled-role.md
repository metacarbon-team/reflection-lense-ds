# 0008. Disabled as a role

- Status: Accepted
- Date: 2026-10-28
- Supersedes: the `disabled` state of [0002](0002-semantic-color-naming.md) (`bg/neutral/disabled`, `fg/neutral/disabled`, `stroke/neutral/disabled`)

## Context

[0002](0002-semantic-color-naming.md) made `disabled` a state inside the neutral role. A disabled control is not a neutral control in a different state, though: a disabled primary button, danger button or input all look the same, whatever their role. And an opaque disabled fill picked for one layer is wrong on the others.

## Decision

### Names

`disabled` is a **role**, next to `neutral`, `accent` and the status roles, with a minimal set:

| Token             | Purpose                                                         | Opacity     |
| ----------------- | --------------------------------------------------------------- | ----------- |
| `bg/disabled`     | fill of any disabled control, including solid (emphasized) ones | translucent |
| `fg/disabled`     | text and icons of any disabled control                          | translucent |
| `stroke/disabled` | boundary of any disabled control                                | translucent |

- No prominence, context or state. A disabled control of any role uses these three tokens.
- `disabled` leaves the state segment, so the value sets stay disjoint; states are `hover` and `pressed`.
- In Figma the names need no repeated segment: there is no `bg/disabled/…` group.

### Opacity classes

A token is translucent when its scope is `ghost`, `stroke` or `blanket`, or its name contains `raised` ([0007](0007-raised-background.md)) or the `disabled` role. Every other token is opaque.

### Generation ([0003](0003-palette-generation.md))

All three use the neutral text color of the mode with alpha:

- `bg/disabled` — the smallest alpha that moves every neutral layer by at least `disabledStep` in lightness: barely visible, on any layer.
- `fg/disabled` — the smallest alpha that reaches `disabledContrast` (exempt from AA) on every neutral layer, on `raised` and on `bg/disabled`; it must stay below the text contrast target everywhere, so disabled text never reads as enabled.
- `stroke/disabled` — the subtle stroke alpha.

## Alternatives considered

- **A disabled state per role** (`bg/accent/emphasized/disabled`) — rejected: many tokens for one look.
- **Opaque disabled colors** — rejected: one opaque color cannot be barely visible on every layer.

## Consequences

- Components switch to the three disabled tokens as a set; no role-specific disabled colors.
- Platforms composite the disabled tokens over the layer below, like `ghost` and `raised`.

## Open questions

- Calibration of `disabledStep` and `disabledContrast` in the Theme Lab.
