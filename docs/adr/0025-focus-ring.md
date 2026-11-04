# 0025. One focus ring with a translucent halo

- Status: Accepted
- Date: 2026-11-04
- Extends: `focus` in [0002](0002-semantic-color-naming.md); opacity exceptions in [0024](0024-surface-group.md)

## Context

The Figma library had three focus effects: `focus/ring` (a 2px accent ring), `focus/default` (a soft lift on deprecated shadow variables plus a 2px ring) and `focus/input` (lift, 4px ring and a surface gap). Components picked one at random, and the composer in the UI preview used a fourth look: an accent border with a soft accent halo. The halo needs a translucent accent color, and the system had none in the `focus` scope.

## Decision

### Token

| Token                 | Value                                         | Opacity     |
| --------------------- | --------------------------------------------- | ----------- |
| `focus/accent`        | unchanged: accent, 3:1 against every layer    | opaque      |
| `focus/accent/subtle` | the RGB of `focus/accent` at `focusHaloAlpha` | translucent |

- `focusHaloAlpha` is a generator parameter, 0.25 by default.
- `focus/accent/subtle` is decorative. It has no contrast requirement: the 3:1 indicator is the `focus/accent` ring.
- It joins the named exceptions to the opacity-by-scope rule, next to normal `raised`, the `disabled` role and `surface/backdrop`. Opacity still reads from the name.

### The focus ring

One focus indicator for every focusable element, drawn outside the element with no offset and no blur:

| Layer (bottom to top) | Spread | Color                 |
| --------------------- | ------ | --------------------- |
| halo                  | 4px    | `focus/accent/subtle` |
| ring                  | 1px    | `focus/accent`        |

- CSS: `box-shadow: 0 0 0 1px var(--focus-accent), 0 0 0 4px var(--focus-accent-subtle)` (the first shadow is on top).
- Figma: the effect style `focus/ring` is the only focus effect. `focus/default` and `focus/input` are deprecated.
- The ring does not depend on the element's own border; components do not recolor their stroke on focus.

## Alternatives considered

- **Halo on `ghost/accent/pressed`** — rejected: an interaction state, not focus, and a different shade from the ring.
- **Opaque tinted halo** (`bg/accent/subtle`) — rejected: reads as a band on non-neutral backgrounds.
- **A 2px ring without a halo** (the old `focus/ring`) — rejected in favour of the lighter 1px ring the halo makes visible.

## Consequences

- One effect to maintain on every platform; components only switch it on.
- The 1px ring meets WCAG 2.2 AA focus visibility (2.4.7) at 3:1. It does not meet the AAA focus-appearance size (2.4.13, 2px perimeter).
- The Theme Lab exposes `focusHaloAlpha` and previews the ring.
