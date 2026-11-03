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
| [0007](0007-raised-background.md)       | Raised background                              | Accepted |
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
