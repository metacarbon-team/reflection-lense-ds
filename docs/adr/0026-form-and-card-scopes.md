# 0026. Form and card scopes replace raised

- Status: Accepted
- Date: 2026-11-04
- Supersedes: [0007](0007-raised-background.md) (`raised` as a prominence and its opacity exception) and the raised usage in [0017](0017-semantic-surface-usage.md)

## Context

`raised` was a prominence inside `bg/neutral` with two strengths that behave nothing alike: a translucent fill for fields that adapts to any layer, and an opaque white/black surface for modals. It broke the opacity-by-scope rule, made `emphasized` mean two things in the neutral role (a strong solid fill and a lifted card), and gave the grammar a special family. Designers think of these as two kinds of surface, forms and cards, not as one background strength.

## Decision

### Two scopes

| Scope  | For                                                                    | Opacity     |
| ------ | ---------------------------------------------------------------------- | ----------- |
| `form` | inputs, text areas, selects and other form fields on any neutral layer | translucent |
| `card` | cards, modals, menus, popovers and other lifted surfaces               | opaque      |

Both exist only in the neutral role. `raised` leaves the grammar.

| Old                                          | New                                       |
| -------------------------------------------- | ----------------------------------------- |
| `bg/neutral/raised` (+ `hover`, `pressed`)   | `form/neutral` (+ `hover`, `pressed`)     |
| `bg/neutral/raised/emphasized` (+ states)    | `card/neutral/emphasized` (+ states)      |
| —                                            | `card/neutral` (+ `hover`, `pressed`)     |
| —                                            | `card/neutral/subtle` (+ `hover`, `pressed`) |

- `form` has no prominence; `card` has `subtle`, normal (omitted) and `emphasized`.
- `card/neutral/subtle` and `card/neutral`, with their states, take the values of `bg/neutral/subtle` and `bg/neutral` for now. They are separate tokens so cards can diverge from backgrounds later without renaming consumers.
- `card/neutral/emphasized` keeps the white/black endpoint of the old raised emphasized, with opaque states that move inward by `stateStep`. It does not imply `fg/neutral/on-emphasized`.

### Why these are not component tokens

[0001](0001-token-architecture.md) forbids component tokens such as `button/*`. `form` and `card` are not tied to one component: each names a broad class of surfaces that many components share (every field is a form surface; cards, dialogs, menus and popovers are card surfaces). Like `surface`, they say where a fill sits, not which component draws it.

### Opacity

Opacity reads from the scope again: `form` joins `ghost` and `stroke` as a translucent scope; `card` is opaque. The `raised` exception is gone. The remaining named exceptions are the `disabled` role, `surface/backdrop` and `focus/accent/subtle`.

### Generation

Unchanged from [0007](0007-raised-background.md) and [0015](0015-layer-direction.md), under the new names: `form/neutral` is the smallest alpha that moves every neutral layer by at least `formStep` (formerly `raisedStep`), away from the layers where the background leaves room; its states move along the layers. Form composites count as layers for text, boundary and focus contrast and as a base for `ghost`.

## Alternatives considered

- **Keep `raised` and rename only the strengths** — rejected: still a prominence that changes opacity.
- **`card` as a role inside `bg`** — rejected: roles are colors (neutral, accent, statuses), not kinds of surface.
- **Component tokens** (`input/*`, `dialog/*`) — rejected by [0001](0001-token-architecture.md); `form` and `card` cover whole classes of components.

## Consequences

- The generator parameter `raisedStep` becomes `formStep`; validator rule `raised separation` becomes `form separation`.
- Figma variables are renamed in place (IDs kept, bindings intact) and the new card tokens are added.
- Open question from 0007 carries over: whether other roles need `form` (a field inside a danger callout).
