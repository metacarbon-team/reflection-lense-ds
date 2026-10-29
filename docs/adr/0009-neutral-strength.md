# 0009. Neutral text ladder and neutral emphasized weight

- Status: Accepted
- Date: 2026-10-28
- Supersedes: the `fg/neutral` ladder and the neutral part of the `emphasized` weight in [0003](0003-palette-generation.md)

## Context

[0003](0003-palette-generation.md) builds every `fg` ladder from the bottom: `subtle` at the 4.5:1 floor, `normal` and `emphasized` a step further each. The `fg` seed only replaced `normal` when there was room above it. With a seed near the pole (near-white text in dark mode) there is no room, so the requested text color was replaced by a dimmer one.

The same ADR aligns every `emphasized` fill to the accent's weight. A light accent then turns `bg/neutral/emphasized` into a mid grey, while the neutral solid button must stay strong.

## Decision

### Text ladder of the neutral role

The `fg` seed is the **top** of the ladder:

- `fg/neutral/emphasized` = the seed;
- `fg/neutral` = one `fgStep` from the seed towards the background;
- `fg/neutral/subtle` = the 4.5:1 floor on the worst background.

When the seed is less than two steps beyond the floor, `emphasized` moves past the seed towards the pole and the generator reports it. Other roles keep the bottom-up ladder: they have no text seed.

### Weight of `bg/neutral/emphasized`

The neutral fill uses the larger of the accent's weight and its own floor, `neutralWeightFloor` (near-black in light mode, near-white in dark mode). Hue and chroma still come from the `fg` seed, so the fill keeps the text's tone. Status fills keep the accent weight with the common floor.

## Alternatives considered

- **Seed as `fg/neutral`** (the previous rule) — rejected: the requested color is lost when there is no room above it.
- **A fixed near-black neutral fill** — rejected: it must follow the seeds' hue and still react to a heavier accent.

## Consequences

- The text seed is always visible in the theme as `fg/neutral/emphasized`; body text sits one step softer.
- The neutral solid button stays strong whatever the accent.

## Open questions

- Calibration of `neutralWeightFloor` in the Theme Lab.

## Revisions

- 2026-10-28 — the text ladder has two steps: `fg/neutral` is the seed, `fg/neutral/subtle` the floor. See [0012](0012-two-text-prominences.md).
