# 0019. Neutral subtle shares the surface color

- Status: Accepted
- Date: 2026-11-03
- Supersedes: the three distinct neutral background levels in [0002](0002-semantic-color-naming.md) and [0003](0003-palette-generation.md)

## Context

The neutral hierarchy needs a lighter baseline for content while preserving the semantic distinction between the window background and component fills.

## Decision

- `bg/neutral/subtle` has exactly the same base color as `surface/neutral` in every theme and mode.
- `bg/neutral` is one `layerStep` from that baseline: the previous subtle position, rather than the previous two-step normal position.
- Both background tokens keep hover and pressed states, generated from their new bases. Surface remains a window background without interaction states.
- Layer direction still adapts to preserve contrast (ADR 0015). Raised and emphasized retain their existing meaning; dependent colors are solved against the updated backgrounds.
- Validation checks surface/subtle equality and separation of normal, rather than requiring separation between surface and subtle.

## Consequences

There are two distinct base colors in the neutral stack. Equal values do not make the tokens interchangeable: use surface for the window and bg for content. With the default seeds, normal is `#edebe5` in Light and `#232423` in Dark.

In Role steps, neutral subtle shares the surface's palette anchor; its step therefore differs from the tinted roles' subtle step. Both semantic tokens remain exported.
