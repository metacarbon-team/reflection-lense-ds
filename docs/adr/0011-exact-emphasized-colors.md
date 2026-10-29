# 0011. Emphasized colors are kept exactly

- Status: Accepted
- Date: 2026-10-28
- Supersedes: in [0003](0003-palette-generation.md), the accent shift for on-emphasized contrast, the alignment of status `emphasized` fills to the accent weight, and the status hue shift on conflict with the accent

## Context

[0003](0003-palette-generation.md) keeps the accent near its seed, moves it when its text fails 4.5:1, aligns the status fills to the accent's contrast against the surface and pushes status hues away from the accent. With brand swatches for the status roles, this turned `#f57042` into `#c14003` in light mode and `#ffcab8` in dark mode: the brand colors were no longer in the theme.

## Decision

- `bg/accent/emphasized` is the accent seed and `bg/<status>/emphasized` is the status base color, **exactly**, in every mode. Nothing moves them.
- Everything else in a role is derived from that color: hover and pressed, tinted backgrounds, text, strokes and focus keep its hue and chroma and solve their lightness against the rules of [0003](0003-palette-generation.md).
- `fg/<role>/on-emphasized` adapts instead of the fill: the better of a light and a dark text color, pushed towards white or black until it reaches 4.5:1 on the fill and its states. Pure white or black reaches at least 4.58:1 on any color, so this always succeeds.
- Status hues no longer shift on conflict with the accent; the swatches are chosen to be distinct.
- `bg/neutral/emphasized` has no seed and stays derived ([0009](0009-neutral-strength.md)): the larger of the accent's weight and the neutral floor. The common weight floor of status fills is removed.

## Alternatives considered

- **Alignment to the accent weight** (the previous rule) — rejected: it replaces the brand colors.
- **Exact fills with a fixed on-emphasized color** — rejected: mid-tone fills would fail 4.5:1.

## Consequences

- Solid buttons and badges carry the brand colors as given, in both modes; their visual weight differs by role.
- A mid-tone fill gets near-black or near-white text, whichever passes.

## Open questions

- The `bg` and `fg` seeds still move in edge cases: a background with no room for `raised` ([0007](0007-raised-background.md)), a text seed with no room for its ladder ([0009](0009-neutral-strength.md)), background drift for text contrast.
