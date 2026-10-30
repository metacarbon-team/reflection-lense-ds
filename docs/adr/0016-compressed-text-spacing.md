# 0016. Text spacing compresses on mid tones

- Status: Accepted
- Date: 2026-10-30
- Supersedes: `fgStep` as a hard minimum between `fg/<role>` and `fg/<role>/subtle` in [0012](0012-two-text-prominences.md)

## Context

The background never moves ([0015](0015-layer-direction.md)). On a mid tone (OKLCH lightness about 0.5–0.65) even the better of white and black text barely clears 4.5:1: on `#847033`, black reaches 4.35 and white 4.83. Subtle text must still reach 4.5:1 on every layer, so it sits just below the pole, and there is no room for primary text a full `fgStep` (0.08) beyond it. The validator reported one `fg prominence separation` per role, six in all, although both text levels were readable.

theme-contract-v1 met the same limit by compressing: the accent text ladder kept its target spacing where it fit, compressed it where the readable band was narrower, kept every tone distinct and above 4.5:1, and reported the achieved scale.

## Decision

- `fgStep` (and `roleTextStep`) are targets. When the step does not fit between the 4.5:1 floor and white or black, primary text sits at the pole and the spacing is compressed.
- The two prominences must stay distinct: at least **0.01** of screen lightness apart. Below that the build does not pass.
- The generator reports each compression as an adjustment on `fg/<role>`: "prominence spacing compressed to N% of fgStep".
- The validator accepts a spacing under `fgStep` only when primary text is pure white or black (no room left) and the spacing is at least 0.01. It still reads only names and hex values.
- The Theme Lab shows compression as a warning next to the rule badge, not as a violation.

## Consequences

- `#847033`: `fg/neutral` is `#ffffff`, `fg/neutral/subtle` `#f7f8f7`, spacing 28% of `fgStep`; every rule passes, and the Lab warns "mid tone: text spacing compressed".
- On the most saturated mid tones (4 of 300 random seed sets), the band between the floor and the pole is narrower than 0.01 itself; there the validator still reports the two prominences, since one level of text is all such a background allows.
- Unlike v1, the background is not moved to make room.

## Alternatives considered

- **Subtle text below 4.5:1** — rejected: it would be unreadable by the contrast rule.
- **Collapse both levels into one color silently** (v1's neutral text) — rejected: the hierarchy disappears without a trace.
- **Move the background** (v1's surface correction) — rejected by [0015](0015-layer-direction.md).
