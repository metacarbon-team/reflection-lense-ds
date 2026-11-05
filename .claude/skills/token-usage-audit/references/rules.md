# Rule catalogue

Rule ids are stable across runs and reports. A4 is retired: modes on documentation frames belong to the documentation skill.

Every rule runs on own layers, and on instance layers only for the fields an instance overrides (SKILL.md, "Own layers and overrides"). Rendered checks (B7, C10, C11) therefore follow the main component: an instance without an override is not re-checked on the background it is placed on.

Token grammar (ADR 0002): `scope/role/[prominence]/[context]/[state]`.

- **Scopes**: `surface`, `bg`, `form`, `card`, `fg`, `stroke`, `ghost`, `focus`.
- **Form and card** (ADR 0026, 0027): `form/neutral` (+ `hover`, `pressed`) is translucent, neutral only, with no prominence. Cards are opaque: `card/neutral/subtle`, `card/neutral`, `card/neutral/emphasized`, and one card per status role, `card/{success,warning,danger,info}` — the role's lightest tint (formerly `bg/<status>/subtle`). Each has `hover` and `pressed`. Status roles keep `bg/<status>` and `bg/<status>/emphasized`; accent keeps `bg/accent/subtle`.
- **Focus** (ADR 0025): `focus/accent` (opaque ring) and `focus/accent/subtle` (translucent halo). Components use the single `focus/ring` effect style: halo spread 4px, ring spread 1px.
- **Surface group** (ADR 0024): no roles, exactly `surface` (window canvas; Figma `surface/surface`) and `surface/backdrop` (translucent).
- **Roles**: `neutral`, `accent`, `success`, `warning`, `danger`, `info`.
- **Prominences**: `subtle`, normal (omitted), `emphasized`.
- **Context**: `on-emphasized`.
- **States**: `hover`, `pressed`.
- **Disabled**: one universal set, `bg/disabled`, `fg/disabled` and `stroke/disabled`.

In Figma, a token whose name collides with a group repeats its last segment (`bg/neutral/neutral`). The audit strips that repetition before matching.

## Semantic usage guide

Product decisions clarified on 2026-11-03. Use these during contextual review alongside the script's findings; the script does not automatically infer every layer's product purpose.

| Token family | Intended use | Audit interpretation |
| --- | --- | --- |
| `surface` | Window background only. | A confirmed content fill above the window background should use `bg/*`. A root frame alone does not prove a window background. |
| `bg/*` | Backgrounds of anything above the window background. | Choose role and strength for the content; nesting alone does not prescribe every choice. |
| `bg/neutral/subtle` / `bg/neutral` | Subtle shares the surface color; normal is one layer step away (ADR 0019). | Equal surface/subtle values are intentional. Keep bindings distinct by purpose: window versus content. |
| `form/neutral` | Inputs, text areas, selects and other form fields; translucent. | Review the element's purpose and rendered background. |
| `card/neutral/*` | Cards, modals, menus, popovers and other lifted surfaces; opaque. `subtle` and normal currently equal `bg/neutral/subtle` and `bg/neutral`; `emphasized` is the white/black endpoint, mainly for modals. | Equal card/bg values are intentional; keep bindings distinct by purpose. Mainly is a preference, not an exclusive restriction. |
| `card/<status>` | Informative cards, callouts and status panels (ADR 0027). | Text uses the role's `fg`; contrast is validated as on any tinted background. |
| `fg/<role>` and `fg/<role>/subtle` | Text and icon hierarchy. | The designer chooses the hierarchy; validate scope, pairing and contrast rather than imposing a token on every label type. |
| `stroke/*` | Boundaries and dividers, with strength chosen by the designer. | Do not report a prominence choice alone as misuse. Existing binding, scope and contrast checks still apply. |
| `surface/backdrop` | Backdrop behind a modal, covering the underlying interface. | Distinguish the backdrop from the modal body, which uses a background token. |
| Status roles: `success`, `warning`, `danger`, `info` | Express the sentiment of an action or feedback. | Selection is a designer judgment; do not infer mandatory sentiment from a label alone. Pairing and contrast rules still apply. |

### Local mode inversion

A dark tooltip or panel in a light interface, or a light component in a dark interface, uses a local light ↔ dark mode inversion on that component. Descendants resolve the same semantic tokens in the local mode; no separate inverse tokens are needed. Do not flag a deliberate component mode override as misuse or reset it to the page mode. Audit resolved colors in the component's actual mode. Documentation-frame modes remain outside this audit's scope.

### Emphasized card text

`card/neutral/emphasized` is an opaque lifted surface, distinct from the strong solid fill `bg/neutral/emphasized`. It does not automatically require `fg/neutral/on-emphasized`. Use the normal/subtle foreground hierarchy and check rendered contrast in the component's actual mode, including custom themes.

## A — Bindings

### A1 raw-color (warning)

A visible solid paint with no variable.

- **Why**: a raw color does not follow the theme, so it is wrong in the other mode and after every palette change.
- **Skipped**: paints at or below 1% opacity (hit areas, placeholders) and paints inside icon instances (the icon set owns them).
- **Fix**: bind the semantic token the layer's role calls for (see A5).

### A2 missing-variable (error)

Bound to a variable id that is not in the file: deleted, or from a library that is not local.

- **Why**: it renders a stale cached color and does not change with the mode.
- **Fix**: rebind to the current semantic token. Map from the old name when the variable's old name is known.

### A3 deprecated-or-primitive (error)

The paint is bound to one of these:

- a hidden semantic token (deprecated);
- a variable outside the `Theme` collection, such as `Palette` (`reflection/light/...`) or `Core`.

- **Why**: components bind semantic tokens only (ADR 0001, 0004). Primitives do not switch with the mode and skip the generator's guarantees.
- **Fix**: the semantic token that resolves to this primitive in this context. For a deprecated token, use the replacement named in its description.

### A5 role-mismatch

The token's scope does not fit the layer.

- **Text filled with anything but `fg/*`** (error): text always takes `fg/*`.
- **`fg/*` fill on a non-text layer**:
  - Icons and vector leaves are fine, checked by C11.
  - A container with children (warning): it is almost always meant to be `bg/<role>/emphasized`.
  - Another leaf shape (warning): allowed for indicators, dots, bars and thumbs, checked at 3:1 by C11.
- **`stroke/*` used as a fill on a layer thicker than 2px** (warning): stroke tokens are translucent boundaries, so a 1–2px divider is fine but an area needs `bg/*`.
- **`bg/*`, `surface/*` or `ghost/*` used as a stroke** (warning): boundaries take `stroke/*`.

### A6a paint-opacity (error)

A token-bound paint whose opacity differs from the token's alpha.

- **Why**: Figma renders `paint.opacity`. While the opacity equals the token's alpha, it stays linked to the variable and follows the mode. Once it differs (typed by hand, or bound at opacity 1), it is a fixed value: at 100%, a translucent token such as `fg/disabled` (35%) renders opaque.
- **Fix**: build the paint at the token's resolved alpha and bind it (see SKILL.md). Rebinding the same token over the broken paint does not reset it.

### A6b layer-opacity (warning)

A layer (node) with opacity below 100%.

- **Why**: transparency belongs in token colors, where the generator has validated it. Layer opacity fades text and icons below their contrast floor and hides the real color from the audit.
- **Exceptions**: animation frames, images, and deliberate placeholders. Say which one applies, or replace it with the token: a dimmed icon in a disabled state takes `fg/disabled`.

## B — Pairings and states

### B7 pairing (error)

- **`fg/<role>/on-emphasized` must sit on `bg/<same role>/emphasized`** (or its hover/pressed). On any other background it has no guaranteed contrast.
- **Text on `bg/<role>/emphasized` must be `fg/<role>/on-emphasized`.** `fg/disabled` is the only exception.

The background is the nearest opaque fill behind the text, translucent layers composited onto it.

### B8 states (component sets with a `State` property)

- **hover / pressed** on a filled control must be `<default token>/hover` or `/pressed` (warning otherwise).
  - **Transparent controls** take `ghost/<role>/hover|pressed` for hover and pressed. A `bg/*` fill there is an error, because it is calibrated for one layer and shows as a patch on any other surface. This covers:
    - **Ghost**: no fill and no boundary at rest.
    - **Outline**: no fill, but a boundary on the root or on a direct "Ring" child.
- **disabled**: every bound paint in the variant uses `bg/disabled`, `fg/disabled` or `stroke/disabled`, whatever the control's role (error otherwise). `focus/*` and `shadow/*` are exempt.
  - Only a ghost control keeps no fill when disabled (warning if it has one).
  - Outline and filled controls take `bg/disabled`.
- **focus**: the variant applies the `focus/ring` effect style (ADR 0025), on itself or a child; a recolored stroke is not a focus indicator (warning otherwise).

### B9 form-ghost (warning)

`form/neutral` on a tinted role background (`bg/accent`, `bg/success`, `card/danger`, …).

- **Why**: form fields step away from the neutral stack (ADR 0007, 0026). On a tint they read as a hole.
- **Fix**: put form fields on a neutral layer, or use the role's own steps.

## C — Rendered result

### C10 text-contrast (error)

Rendered text color (paint opacity × layer opacity) against the composited background, in the node's own mode.

- **Floors**: 4.5:1 for text under 24px, 3:1 for 24px and larger.
- **Disabled is exempt**: WCAG 1.4.3 and 1.4.11 exclude inactive components, so `fg/disabled` text and everything inside a disabled variant (or an instance of one) is not checked by C10 or C11.
- **Fix**: the token the generator pairs with that background. A failure on a correct pairing is a generator problem: report it, do not hand-pick a color.

### C11 non-text-contrast (error)

These need 3:1 against their background:

- icons and leaf graphics filled with `fg/*` (except `fg/disabled`);
- boundaries drawn with `stroke/<role>/emphasized`.

### C12 shadows (warning)

- A drop or inner shadow without an effect style.
- A shadow whose style is not a `shadow/*` or focus style.

Shadow colors come from the shadow tokens (ADR 0010) through the styles.

## Not in scope

- Modes set on documentation frames, how many themes a page shows, an opaque root behind a doc frame. These belong to the documentation skill.
- Spacing, radius and typography tokens. A later extension could add them with the same report shape.
