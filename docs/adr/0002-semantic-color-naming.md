# 0002. Semantic color naming and opacity classes

- Status: Accepted
- Date: 2026-10-28
- Supersedes: —

## Context

Semantic color tokens are the public API of the system ([0001](0001-token-architecture.md)). Their names must be predictable for designers, developers and agents, map one-to-one between Figma and code, and tell the consumer everything that matters about the token — including whether it is translucent.

## Decision

### Grammar

```
scope / role / [prominence] / [context] / [state]
```

One shared prominence scale for every scope and role. Only meaningful combinations are instantiated.

| Segment    | Values                                                                                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scope      | `surface` — whole-window canvas · `bg` — backgrounds · `fg` — text and icons · `stroke` — boundaries and dividers · `focus` — keyboard focus indicator, always the accent color · `blanket` — modal backdrop · `ghost` — translucent fills of transparent controls (working name) |
| role       | `neutral` · `accent` · `success` · `warning` · `danger` · `info`                                                                                                                                                                                                                  |
| prominence | `subtle` · normal (omitted) · `emphasized`                                                                                                                                                                                                                                        |
| context    | `on-emphasized` — foreground paired with the same role's emphasized background                                                                                                                                                                                                    |
| state      | default (omitted) · `hover` · `pressed` · `disabled` (one universal neutral set)                                                                                                                                                                                                  |

The value sets are disjoint: no value appears in two segments. Validators rely on this.

### Meaning of `emphasized`

`emphasized` means the same in every role: a **strong solid fill** that carries `on-emphasized` content. This includes neutral — `bg/neutral/emphasized` is dark in light mode and light in dark mode, as strong as the other solid buttons.

### Neutral background stack

Nesting uses only `surface` and the two lower `bg/neutral` steps:

```
surface/neutral → bg/neutral/subtle → bg/neutral
```

`subtle` is the step closest to `surface`. Deeper nesting is separated by `stroke` and shadows, not by more background shades.

### Opacity classes

Whether a token is translucent is fixed by its **scope** and never changes between themes, modes or versions.

| Opaque                         | Translucent                  |
| ------------------------------ | ---------------------------- |
| `surface`, `bg`, `fg`, `focus` | `ghost`, `stroke`, `blanket` |

Moving a token between classes is a major change ([0001](0001-token-architecture.md)). The class is also recorded in the token's DTCG `$extensions`, but the name stays the source of truth.

### Interaction states

- **Opaque fills** — surfaces, backgrounds, solid controls — get `hover` and `pressed` tokens generated per pair ([0003](0003-palette-generation.md)), shipped as plain opaque colors.
- **Transparent controls** — ghost buttons, list rows, nav items — have no fill at rest and use `ghost/<role>/hover` and `ghost/<role>/pressed` as their **only** fill. Nothing is ever composited over another fill, so every platform draws a plain color.
- `disabled` is one universal neutral set (`bg/neutral/disabled`, `fg/neutral/disabled`, `stroke/neutral/disabled`).

### Inverse regions

There are no inverse tokens. A region that must look inverted (tooltip, toast, dark navigation in a light theme) switches its container to **forced dark mode** — in light and dark themes alike — and every token inside re-resolves:

- web: `data-mode` on the container;
- native: the platform's environment / theme provider mechanism.

### Example: the neutral role

| Token                                                      | Purpose                                           | Opacity     |
| ---------------------------------------------------------- | ------------------------------------------------- | ----------- |
| `surface/neutral`                                          | window canvas, level 0                            | opaque      |
| `bg/neutral/subtle`                                        | first nesting level: panel, sidebar, card         | opaque      |
| `bg/neutral`                                               | second nesting level                              | opaque      |
| `bg/neutral/emphasized` (+`hover`, `pressed`)              | strong neutral fill: solid button, badge, counter | opaque      |
| `bg/neutral/disabled`                                      | any disabled element                              | opaque      |
| `ghost/neutral/hover`, `ghost/neutral/pressed`             | states of transparent controls on any layer       | translucent |
| `blanket/neutral`                                          | modal backdrop                                    | translucent |
| `fg/neutral/subtle`, `fg/neutral`, `fg/neutral/emphasized` | text on the stack                                 | opaque      |
| `fg/neutral/on-emphasized`                                 | text on `bg/neutral/emphasized`                   | opaque      |

### Representation in Figma

Figma cannot hold a variable and a group with the same name (`bg/accent` next to `bg/accent/hover`). An omitted segment is therefore written by **repeating the previous segment**:

| Figma path                        | Canonical name               |
| --------------------------------- | ---------------------------- |
| `bg/accent/accent`                | `bg/accent`                  |
| `bg/accent/emphasized/emphasized` | `bg/accent/emphasized`       |
| `bg/accent/emphasized/hover`      | `bg/accent/emphasized/hover` |

Normalization: collapse two identical consecutive segments into one. Because the value sets are disjoint, a legitimate name never contains a repeated segment.

### Platform names

Generated by the pipeline from the canonical name, never hand-written:

- CSS: `--bg-accent-emphasized-hover`
- Swift / Kotlin: `bgAccentEmphasizedHover`

The pipeline also writes Figma `codeSyntax` for every platform.

## Alternatives considered

- **`default` placeholder in Figma** (`bg/accent/default`) — rejected in favour of repeating the segment.
- **Mixing translucent and opaque tokens in `bg`** — rejected: opacity must be readable from the name.
- **State layers composited over fills (Material 3)** — rejected: compositing differs between platforms and makes `on-emphasized` contrast depend on composition.
- **Layer context for transparent controls** (controls pick opaque colors from the layer they sit on) — rejected in favour of a single translucent fill, as in Atlassian and GitHub Primer.
- **`bg/neutral/emphasized` as a third nesting level** — rejected: it gave `emphasized` a different meaning in the neutral role.
- **Inverse tokens** (Material `inverseSurface`) — rejected: a mode switch on the container needs no new tokens.
- **Opposite mode for inverse regions** (light tooltip in a dark theme) — rejected in favour of forced dark.

## Consequences

- At most three background levels (`surface` + two). Deeper separation relies on `stroke` and shadows.
- Components that sit on arbitrary layers use `ghost` and `stroke`, not layer-specific colors.
- Every platform needs a scoped mode switch for inverse regions.

## Open questions

- Final name of the `ghost` scope.
- Naming of shadows / elevation.

## Revisions

- 2026-10-28 — resolved open questions: `focus` is opaque and uses the accent color; inverse regions use forced dark mode rather than the opposite mode.
- 2026-10-28 — resolved open question: `bg/neutral/subtle` and `bg/neutral` have `hover` and `pressed` (clickable containers).
