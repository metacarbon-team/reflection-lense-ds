# 0033. Ghost state ladder and the active state

- Status: Accepted
- Date: 2026-11-10
- Extends: `ghost` states in [0002](0002-semantic-color-naming.md); ghost generation in [0003](0003-palette-generation.md)

## Context

Ghost fills took the smallest alpha that moved every neutral layer by one `stateStep` (0.03 ΔL). In dark mode `ghost/neutral/hover` came out at 3.9% white: on `surface` it barely showed, and on `card/neutral/emphasized` (black, under menus, Select, Popover and card lists) it did not show at all. The current row of Item and Nav Item used `bg/neutral`, which in dark mode equals the hover composite on `surface`, so the current row and a hovered row looked the same. The grammar had no state for it.

## Decision

### Ladder

Ghost fills climb the same `stateStep` ladder as opaque fills, starting from no fill. No new parameter:

| Token                  | ΔL on every neutral layer and form field |
| ---------------------- | ---------------------------------------- |
| `ghost/<role>/hover`   | at least 2 × `stateStep` from the layer  |
| `ghost/<role>/pressed` | at least 1 × `stateStep` past hover      |
| `ghost/<role>/active`  | at least 1 × `stateStep` past pressed    |

Each alpha is the smallest that meets its rule; the validator checks the same three steps.

### `active`

- A new state in the grammar, for ghosts only: the current row of a transparent control (Item `state="active"`, Nav Item `active`). Utility `bg-ghost-<role>-active`.
- Like hover and pressed it is a fill of its own, never composited over another ghost.
- Text keeps 4.5:1 on all three ghost states over every neutral layer, so `active` is a text background for the generator.

### Consequences

With the default parameters, `ghost/neutral/hover` is 7.8% white in dark mode and 8.6% black in light mode. Because text must read on the stronger fills, role text and `fg/neutral/subtle` move one notch away from the layers in both modes (darker in light, lighter in dark), and so do role strokes, which are derived from role text. Neutral primary text and every layer stay as they were.

## Alternatives considered

- **A separate `ghostStep` parameter** — rejected: a second ladder for the same states; the existing `stateStep` already orders hover and pressed.
- **A dark-only ladder** — rejected: the generator treats both modes alike, and a mode-specific rule would be a new concept.
- **`selected` as the state name** — not chosen: `active` matches the component props (Item `state="active"`, Nav Item `active`).
- **`bg/neutral/selected`, opaque** — rejected: a layer color does not work over cards and menus without a variant per surface.
- **Excluding `active` from text backgrounds** to keep role text unchanged — rejected: text on the current row would fall below 4.5:1.
