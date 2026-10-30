# 0007. Raised background

- Status: Accepted
- Date: 2026-10-28
- Supersedes: the opacity-by-scope rule of [0002](0002-semantic-color-naming.md) (one exception, below)

## Context

Inputs, form fields, raised cards, tags and popovers need a fill that always stands apart from the layer under it, on any layer. The neutral stack of [0002](0002-semantic-color-naming.md) moves only from `surface` towards the text color, so nothing is lighter than `surface` in a light theme, and an opaque fill picked for one layer is wrong on the others.

A separate scope (`fill`, as in Apple's fill colors) was considered and rejected: `bg` already means "a background", and splitting it would leave two scopes for the same job.

## Decision

### Token

`bg/neutral/raised`, with `hover` and `pressed`. `raised` is a prominence value, in the same slot as `subtle` and `emphasized`, and exists only in the neutral role.

| Token                                                  | Purpose                                           | Opacity     |
| ------------------------------------------------------ | ------------------------------------------------- | ----------- |
| `bg/neutral/raised`                                    | inputs, form fields, raised cards, tags, popovers | translucent |
| `bg/neutral/raised/hover`, `bg/neutral/raised/pressed` | states of clickable raised elements               | translucent |

### Opacity classes

Opacity is still readable from the name: a token is translucent when its **scope** is `ghost`, `stroke` or `blanket`, **or** its name contains **`raised`**. Every other `bg` token is opaque. Moving a token between classes stays a major change.

### Direction

`raised` moves **away from the text color**, the opposite of the neutral stack:

- light themes — white with alpha: lighter than the layer under it, on every layer;
- dark themes — black with alpha: sunken below the layer under it.

Moving away from the text means `raised` never costs text contrast.

### Generation ([0003](0003-palette-generation.md))

- Alpha is the smallest 8-bit value that moves every neutral layer (`surface`, `bg/neutral/subtle`, `bg/neutral`) by at least `raisedStep` in OKLCH lightness, measured on the composite.
- `surface` is the layer with the least room. When the seed leaves no room (a pure white or pure black background), `surface` moves towards the text color until `raised` fits, and the generator reports the shift. Background drift for text contrast never takes that room back.
- `hover` and `pressed` move towards the text color, like every other state: each is a `stateStep` beyond the previous one, on every layer. A hovered raised element may therefore be no lighter than the layer under it; the room on the far side of `surface` is too small for a full state step.
- Raised composites count as layers for text, boundary (`stroke/<role>/emphasized`) and focus contrast, and the default `raised` composite counts as a base for `ghost` visibility.

## Alternatives considered

- **A separate `fill` scope** — rejected: two scopes for backgrounds.
- **Opaque `raised`** (a fixed lightest color, as in theme-contract-v1) — rejected: one color cannot be lighter than every layer it sits on.
- **States as lighter or less translucent `raised`** — rejected: there is not enough lightness beyond `surface` for a state step.
- **Lighter `raised` in dark themes too** (Apple's elevated fields) — rejected in favour of sunken fields.

## Consequences

- Platforms composite `raised` over the layer below; it is one translucent color, like `ghost`.
- A light seed at or near white is no longer kept exactly: `surface` steps down so `raised` can be lighter.
- Validators check the direction and the step of `raised` and its states on every neutral layer.

## Open questions

- Calibration of `raisedStep` in the Theme Lab.
- Whether other roles need `raised` (for example a field inside a danger callout).

## Revisions

- 2026-10-30 — `raisedStep` calibrated to 0.02, nearly all the room above the default paper (`#faf8f3` is 0.021 below white). White tinted with the surface's tone was tried and rejected: on the surface the cool white is what makes `raised` visible, and a tinted white is darker, which leaves even less room.
- 2026-10-30 — raised moves opposite the layers, or on their side when the background leaves no room; the background no longer moves for it. See [0015](0015-layer-direction.md).
