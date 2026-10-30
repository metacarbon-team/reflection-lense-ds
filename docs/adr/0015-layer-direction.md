# 0015. The background never moves; layers adapt to it

- Status: Accepted
- Date: 2026-10-30
- Supersedes: background drift in [0003](0003-palette-generation.md); "the neutral stack moves from `surface` towards the text color" in [0002](0002-semantic-color-naming.md); "raised moves away from the text" and "a background without room for raised moves" in [0007](0007-raised-background.md)

## Context

The background and the text are separate seeds, but one direction drove everything: layers, states and text moved from the background towards the text, raised away from it. When that did not fit, the generator moved the background: a mid-tone `#777777` became `#b9b9b9`, a pure white `#ffffff` became `#f8f8f8`, a pure black `#000000` became `#070707`. The background is what the designer chose, and the rest of the theme is built from it, so it is the one color that must not move.

## Decision

- **`surface/neutral` is the background seed, always.** The generator has no background drift.
- **Three directions**, each searched in turn:
  - the **text** sits on its seeded side of the background, or on the other side when it cannot reach 4.5:1 there;
  - the **layers** (subtle, normal, their states, tinted role backgrounds, neutral ghost) move towards the text, or away from it where moving towards it would cost text contrast (mid tones);
  - **raised** moves opposite the layers, or on their side where the background leaves no room beyond it (pure white, pure black).
- Role ghosts tint towards a mid tone, or towards the layers' side when the layers move away from the text, so a hovered ghost never costs text contrast.
- The first build that passes every rule wins; ordinary themes take the first (text and layers on the seeded side, raised opposite), so they are unchanged. When none passes, the build that keeps text readable with the fewest other violations is kept, and the validator reports what is left.
- The validator checks that raised sits on one side of every layer, the same side for all, by at least `raisedStep`, instead of requiring the side opposite the layers.

## Consequences

- Default themes (`#f8f6f0`, `#1a1b1a`) take the first build and are unchanged by this decision.
- Over 600 random seed sets the background never moves, and text reaches 4.5:1 everywhere.
- **Mid tones** (OKLCH lightness about 0.5–0.65): the better of white and black text reaches only about 4.6:1 on the background itself (`#777777`: white 4.48, black 4.68), so there is little room between the 4.5:1 floor and the pole for two text levels; their spacing compresses ([0016](0016-compressed-text-spacing.md)). The layers there go away from the text and look sunken.
- Pure white and pure black backgrounds keep their seed; raised is then sunken on white and lifted on black.
- Unusual seeds take up to eight builds per mode; ordinary themes take one.

## Open questions

- Whether the Theme Lab should warn when a background is in the mid-tone range.
