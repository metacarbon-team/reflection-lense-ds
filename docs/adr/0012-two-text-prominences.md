# 0012. Two text prominences

- Status: Accepted
- Date: 2026-10-28
- Supersedes: the three `fg` prominences of [0002](0002-semantic-color-naming.md) and the three-step text ladder of [0009](0009-neutral-strength.md)

## Context

Text had three prominences: `subtle`, normal and `emphasized`. With the text seed at the top ([0009](0009-neutral-strength.md)), normal sat one `fgStep` below it, so the two upper steps were barely distinguishable (`#1a1b1a` and `#2e2f2e` in light mode), while the gap to `subtle` was large. The Mirror concept uses two levels of text: primary and secondary.

## Decision

Text has **two** prominences:

| Token              | Purpose        | Neutral                                 |
| ------------------ | -------------- | --------------------------------------- |
| `fg/<role>`        | primary text   | the `fg` seed                           |
| `fg/<role>/subtle` | secondary text | the 4.5:1 floor on the worst background |

- `fg/<role>/emphasized` no longer exists. `emphasized` stays a prominence of `bg` (solid fills), and `on-emphasized` is unchanged.
- **Neutral**: `fg/neutral` is the seed. When the seed is less than `fgStep` beyond the floor, it moves until it is, and the generator reports it.
- **Accent and status roles** have no text seed: `fg/<role>` is `roleTextStep` (ΔL, at least `fgStep`) beyond its own floor, so it keeps the role's color and stays clearly apart from `subtle`. Hue and chroma come from the role's color. Colored primary text is lighter in weight than neutral text, as colored text usually is.
- Strokes and the disabled color, which were built on `fg/<role>/emphasized`, use `fg/<role>`.

## Alternatives considered

- **Three prominences with a larger step** — rejected: the concept and the components need two levels of text.
- **Role text at the same contrast as neutral text** — rejected: at the contrast of a near-black seed (about 16:1) colored text turns near-black or near-white and loses its color.

## Consequences

- Six tokens disappear (`fg/*/emphasized`); in Figma they are rebound to `fg/*` and hidden as deprecated ([0004](0004-figma-sync.md)).
- Emphasis inside text is expressed by weight, not by a separate color.

## Revisions

- 2026-10-30 — `fgStep` and `roleTextStep` are targets; on mid tones the spacing compresses at the pole. See [0016](0016-compressed-text-spacing.md).
