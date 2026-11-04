# 0024. Surface group: canvas and backdrop

- Status: Accepted
- Date: 2026-11-04
- Supersedes: `surface/neutral` and the `blanket` scope of [0002](0002-semantic-color-naming.md); the `blanket/neutral` usage in [0017](0017-semantic-surface-usage.md)

## Context

The product Styleguide (UI Kit) keeps the window canvas and the modal backdrop together, as `surface/surface` and `surface/backdrop`. We had the same two colors under different names: `surface/neutral` (the canvas, with a role that never varies) and `blanket/neutral` (a separate scope for a single token). Both describe what lies behind everything else, so they belong in one group.

## Decision

### Names

The `surface` scope has no roles and holds exactly two tokens:

| Canonical name     | Figma path         | CSS                  | Purpose                                     | Opacity     |
| ------------------ | ------------------ | -------------------- | ------------------------------------------- | ----------- |
| `surface`          | `surface/surface`  | `--surface`          | window canvas, level 0; nothing else        | opaque      |
| `surface/backdrop` | `surface/backdrop` | `--surface-backdrop` | backdrop behind a modal, over the interface | translucent |

- The Figma path of `surface` repeats the segment by the rule of [0002](0002-semantic-color-naming.md), because a `surface` group exists next to it.
- `backdrop` is a value of the `surface` scope only; it appears in no other segment, so the value sets stay disjoint.
- The `blanket` scope is removed. Scopes are `surface`, `bg`, `fg`, `stroke`, `focus`, `ghost`.
- The neutral background stack reads `surface → bg/neutral/subtle → bg/neutral`.
- The generator parameter `blanketAlpha` becomes `backdropAlpha`.

### Opacity

`surface/backdrop` is translucent although `surface` is an opaque scope. It joins the named exceptions to the opacity-by-scope rule, next to normal `raised` ([0007](0007-raised-background.md)) and the `disabled` role ([0008](0008-disabled-role.md)): opacity still reads from the name.

### Versioning

Both packages are unreleased (`0.0.0`), so the old names are removed without deprecated aliases. Once released, a rename like this needs aliases for one major version ([0001](0001-token-architecture.md)).

## Alternatives considered

- **Keep `surface/neutral` and `blanket/neutral`, map them in migration notes only** — rejected: two names for the same concept between the Styleguide and the system.
- **Keep the `blanket` scope and rename only the canvas** — rejected: a one-token scope for something that is a surface.
- **`surface/neutral` and `surface/backdrop`** — rejected: the canvas has no other role, so `neutral` carries no information.

## Consequences

- The Figma library renames its variables to `surface/surface` and `surface/backdrop` on the next sync ([0004](0004-figma-sync.md)).
- The validator special-cases the `surface` scope: exactly these two names, no role or modifiers.
- Consumers of `--surface-neutral` and `--blanket-neutral` switch to `--surface` and `--surface-backdrop`.
