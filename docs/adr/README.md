# Architecture Decision Records

One architectural decision per file, numbered in order. An accepted ADR is not rewritten in substance: when a decision changes, a new ADR supersedes the old one and both stay in the history.

| #                                       | Decision                                       | Status   |
| --------------------------------------- | ---------------------------------------------- | -------- |
| [0001](0001-token-architecture.md)      | Token architecture and source of truth         | Accepted |
| [0002](0002-semantic-color-naming.md)   | Semantic color naming and opacity classes      | Accepted |
| [0003](0003-palette-generation.md)      | Palette generation and accessibility rules     | Accepted |
| [0004](0004-figma-sync.md)              | Figma ↔ source of truth sync                   | Accepted |
| [0005](0005-dimension-scales.md)        | Dimension scales                               | Accepted |
| [0006](0006-typography.md)              | Typography                                     | Accepted |
| [0007](0007-raised-background.md)       | Raised background                              | Superseded by 0026 |
| [0008](0008-disabled-role.md)           | Disabled as a role                             | Accepted |
| [0009](0009-neutral-strength.md)        | Neutral text ladder and emphasized weight      | Accepted |
| [0010](0010-shadow-tokens.md)           | Shadow tokens                                  | Accepted |
| [0011](0011-exact-emphasized-colors.md) | Emphasized colors are kept exactly             | Accepted |
| [0012](0012-two-text-prominences.md)    | Two text prominences                           | Accepted |
| [0013](0013-palette-ramps.md)           | Palette ramps on a fitted grid                 | Accepted |
| [0014](0014-screen-flare.md)            | Lightness steps measured with screen flare     | Accepted |
| [0015](0015-layer-direction.md)         | The background never moves; layers adapt to it | Accepted |
| [0016](0016-compressed-text-spacing.md) | Text spacing compresses on mid tones           | Accepted |
| [0017](0017-semantic-surface-usage.md)  | Semantic surface usage and local modes          | Accepted |
| [0018](0018-nearest-line-height-grid.md) | Round line height to the nearest grid point   | Accepted |
| [0019](0019-neutral-subtle-surface.md) | Neutral subtle shares the surface color       | Accepted |
| [0020](0020-geist-mono.md) | Geist Mono for monospace text | Accepted |
| [0021](0021-dimension-token-exports.md) | Public exports for dimension tokens | Accepted |
| [0022](0022-dtcg-export.md) | DTCG export from Theme Lab | Accepted |
| [0023](0023-all-modes-export.md) | Export all modes together | Accepted |
| [0024](0024-surface-group.md) | Surface group: canvas and backdrop | Accepted |
| [0025](0025-focus-ring.md) | One focus ring with a translucent halo | Accepted |
| [0026](0026-form-and-card-scopes.md) | Form and card scopes replace raised | Accepted |
| [0027](0027-status-cards.md) | The lightest status tint is a card | Accepted |

Statuses: `Proposed` → `Accepted` → (`Superseded by NNNN` | `Deprecated`).

## Template

```md
# NNNN. Title

- Status: Proposed
- Date: YYYY-MM-DD
- Supersedes: —

## Context

What problem we solve and which constraints apply.

## Decision

What we chose.

## Alternatives considered

What else was on the table and why it lost.

## Consequences

What this gives us, what it costs, what becomes mandatory.

## Open questions

What is still undecided within this topic.
```
