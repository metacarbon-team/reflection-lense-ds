# 0017. Semantic surface usage and local modes

- Status: Accepted
- Date: 2026-11-03
- Supersedes: raised prominence and opacity in [0007](0007-raised-background.md), and always-forced-dark inverse regions in [0002](0002-semantic-color-naming.md)

## Context

Forms and inputs need the existing translucent raised fill, while modals usually need an opaque variant. The audit also needs explicit usage guidance without treating designer choices as token errors.

## Decision

- `surface/neutral` is only the window background. Anything above it uses `bg/*`.
- Raised backgrounds serve forms, inputs, modals and menus. `bg/neutral/raised` remains normal (normal omitted), preserving its existing translucent fill and states.
- `bg/neutral/raised/emphasized` uses the same RGB at 100% opacity, mainly for modals. Its opaque hover and pressed states move inward from the white/black endpoint by `stateStep`. Both strengths belong to the neutral background palette.
- Raised emphasized is distinct from `bg/neutral/emphasized`; it does not imply `fg/neutral/on-emphasized`. Foregrounds still follow the normal/subtle hierarchy, with rendered contrast checked in context.
- `fg` versus `fg/subtle` expresses hierarchy. Stroke strength is a designer choice. Status roles express the sentiment of an action or feedback, selected by the designer.
- `blanket/neutral` is the backdrop behind a modal; the modal body uses a background token.
- Inverse components locally switch light ↔ dark. Descendants resolve the same semantic tokens in that local mode. No separate inverse tokens or always-forced-dark rule are needed.

## Consequences

Existing raised consumers retain their behavior. The Theme Lab shows both strengths. The normal raised contrast solver is unchanged: for custom themes where normal raised falls back towards the text, the opaque endpoint requires independently checked content contrast before use.

The audit combines automated checks with contextual review of element purposes. Stroke strength, hierarchy and status sentiment alone are not errors. The usage guide does not imply that every contextual rule is implemented in the audit script.
