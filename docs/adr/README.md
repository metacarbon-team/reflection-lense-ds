# Architecture Decision Records

One architectural decision per file, numbered in order. An accepted ADR is not rewritten in substance: when a decision changes, a new ADR supersedes the old one and both stay in the history.

| #                                     | Decision                                   | Status   |
| ------------------------------------- | ------------------------------------------ | -------- |
| [0001](0001-token-architecture.md)    | Token architecture and source of truth     | Accepted |
| [0002](0002-semantic-color-naming.md) | Semantic color naming and opacity classes  | Accepted |
| [0003](0003-palette-generation.md)    | Palette generation and accessibility rules | Accepted |
| [0004](0004-figma-sync.md)            | Figma ↔ source of truth sync               | Accepted |
| [0005](0005-dimension-scales.md)      | Dimension scales                           | Accepted |
| [0006](0006-typography.md)            | Typography                                 | Accepted |
| [0007](0007-raised-background.md)     | Raised background                          | Accepted |

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
