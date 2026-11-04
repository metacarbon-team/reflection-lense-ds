# 0027. The lightest status tint is a card

- Status: Accepted
- Date: 2026-11-04
- Extends: [0026](0026-form-and-card-scopes.md) (card roles)

## Context

The lightest tint of every status role (`bg/success/subtle`, `bg/warning/subtle`, `bg/danger/subtle`, `bg/info/subtle`) is what informative cards, callouts and status panels are made of. In [0026](0026-form-and-card-scopes.md) the `card` scope was neutral only, so a danger card and a neutral card lived in different scopes.

## Decision

For the four status roles, the subtle background becomes the role's card. It is a rename: values, states and Figma bindings stay.

| Old                                          | New                                 |
| -------------------------------------------- | ----------------------------------- |
| `bg/<status>/subtle` (+ `hover`, `pressed`)  | `card/<status>` (+ `hover`, `pressed`) |
| `bg/<status>` (+ states)                     | unchanged                           |
| `bg/<status>/emphasized` (+ states)          | unchanged                           |

- `card` roles: `neutral` (`subtle`, normal, `emphasized`) and the status roles (normal only).
- `accent` keeps `bg/accent/subtle`; it has no card.
- A status card is its role's lightest tint: generation, palette slot, the `bg` prominence separation (`card/<status>` → `bg/<status>`) and the text contrast of `fg/<status>` and `fg/<status>/subtle` on it are unchanged.

## Consequences

- `bg/<status>` keeps two strengths, normal and emphasized; the grammar does not allow `bg/<status>/subtle` any more.
- In Figma the renamed variables follow the repeated-segment rule of [0002](0002-semantic-color-naming.md): `card/danger` is written `card/danger/danger` next to `card/danger/hover`.
