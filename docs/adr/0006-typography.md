# 0006. Typography

- Status: Accepted
- Date: 2026-10-28
- Supersedes: —
- Mono font choice superseded by [0020](0020-geist-mono.md): use Geist Mono. The original choice below is retained as history.
- Size primitives, the modular scale, the 12px minimum and the removal of link styles superseded by [0030](0030-type-scale-and-text-roles.md): Tailwind v4 steps, text roles per viewport, 10px minimum, a `link` role.

## Context

Typography must look the same on web and native, scale on desktop and mobile, respect the user's system text size, and follow the same rules as colors: a small public API, predictable names, no component tokens ([0001](0001-token-architecture.md)).

The current Figma library has a reasonable set of roles, but it is not usable as a contract:

- variables are named by role (`body/small/font-size`) and roles borrow each other's sizes, so they are primitives under semantic names;
- there are component styles (`Button/*`, `Link/*`) and a product prefix (`Agent Harness/`);
- weights are font-specific style strings (`"Text Book"`), mixing optical size and weight;
- tracking and line height are absolute px;
- size names are inconsistent across roles (`small/medium/large`, `default/hero`, `compact`), and `medium` means both a size and a weight.

## Decision

### Fonts

| Family  | Font           | Used for            |
| ------- | -------------- | ------------------- |
| `sans`  | NaN Serf Sans  | UI and body text    |
| `serif` | NaN Serf B     | display and heading |
| `mono`  | JetBrains Mono | code                |

- Fonts are custom and the same for every theme: **themes cannot change fonts**.
- Web uses the variable fonts (WOFF2), native uses TTF.

### Two layers

Platforms consume **composite text styles**. Primitives are also exposed as variables, in the spirit of Tailwind, so layouts can use them directly.

### Primitives

| Primitive         | Values                                                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `font/family/*`   | `sans`, `serif`, `mono`                                                                                                              |
| `font/size/*`     | Fixed small steps named by px: `12`, `13`, `14`. From base up, a modular scale with Tailwind-like names: `base`, `lg`, `xl`, `2xl` … |
| `font/weight/*`   | Numeric: `regular` 400, `medium` 500, `semibold` 600, `bold` 700                                                                     |
| `font/leading/*`  | Multipliers (`tight`, `snug`, `normal`, `relaxed`); each platform rounds the resulting line height to a 4px grid                     |
| `font/tracking/*` | In `em`, so tracking stays proportional when text is scaled                                                                          |

### Size scale

- **Hybrid.** Small UI sizes (12, 13, 14) are fixed and never generated. From base (the body size, currently 16px) upward, sizes follow a **modular scale**.
- **Desktop and Mobile are modes** with different ratios: small steps stay nearly the same, large steps are smaller on mobile.
- The generator computes the scale; default values are pushed into Figma.
- 13px is kept as a fixed step for dense interfaces.

### Semantic grammar

```
role / [size] / [weight]
```

| Segment | Values                                                                     |
| ------- | -------------------------------------------------------------------------- |
| role    | `display` · `heading` · `body` · `label` · `caption` · `code` · `overline` |
| size    | `xsmall` · `small` · normal (omitted) · `large`                            |
| weight  | regular (omitted) · `medium` · `semibold` · `bold`                         |

- Only meaningful combinations are instantiated (for example `xsmall` exists only for `body`).
- The size and weight sets are disjoint. In Figma an omitted segment is written by repeating the previous one, with the same normalization as colors ([0002](0002-semantic-color-naming.md)).
- No component styles: buttons and links use `label` / `body`; a link's underline is added by the component.
- No product prefix in style names.

### Migration from the current Figma styles

| Current                                     | New                                         |
| ------------------------------------------- | ------------------------------------------- |
| `Display/Hero`                              | `display/large`                             |
| `Display/Default`                           | `display`                                   |
| `Heading/Large`, `Medium`, `Small`          | `heading/large`, `heading`, `heading/small` |
| `Body/Large/Large` (+ `Medium`, `Semibold`) | `body/large` (+ `/medium`, `/semibold`)     |
| `Body/Deafault/Default` (+ weights)         | `body` (+ `/medium`, `/semibold`)           |
| `Body/Small/Small` (+ weights)              | `body/small` (+ weights)                    |
| `Body/Compact/Compact` (+ weights)          | `body/xsmall` (+ weights)                   |
| `Label/Large`, `Default`, `Small`           | `label/large`, `label`, `label/small`       |
| `Caption/Default`                           | `caption`                                   |
| `Caption/Overline`                          | `overline`                                  |
| `Caption/Micro` (10px)                      | `caption/small`, at least 12px              |
| `Code/Default`, `Code/Default Bold`         | `code`, `code/bold`                         |
| `Code/Small`, `Code/Small Bold`             | `code/small`, `code/small/bold`             |
| `Button/*`, `Link/*`                        | removed                                     |

### Accessibility

- Text uses the same `fg` tokens at every size, so **4.5:1 applies to large text too** ([0003](0003-palette-generation.md)).
- Minimum text size is 12px.
- **User text scaling** (Dynamic Type on iOS, font scale on Android, `rem` and zoom on web):
  - `body`, `label`, `caption`, `code` scale fully;
  - `display` and `heading` scale with an upper cap;
  - web sizes are in `rem`;
  - components must reflow text and never fix a height to fit it.

### Figma

Figma variables cannot hold `em` or multipliers, so the generator writes per-style px values for line height and tracking into Figma. Weights are numeric variables.

## Alternatives considered

- **Keep the current Figma convention** — mixes primitives and semantics, size and weight, and contains component styles.
- **Material type scale names** (`headline`, `title` …) — the existing roles already cover the needs.
- **Pure modular scale** — leaves no 14px between 12.8 and 16 at common ratios; UI needs fixed small steps.
- **Tailwind's type scale values** — a modular scale was chosen; only the naming style is borrowed.
- **3:1 for large text** — rejected: large text uses the same `fg` tokens.

## Consequences

- The Figma library needs a migration of text styles and variables (table above).
- Every component must handle reflow under user text scaling.
- The generator owns line-height and tracking conversion for each platform and for Figma.

## Open questions

- Ratio of the modular scale for each mode, and the base value.
- The upper cap for `display` / `heading` scaling.
- Values of the leading multipliers and tracking steps.
- NaN Serf B optical sizes (Micro, Text, Headline, Display): rely on the variable font's `opsz` axis on web (to verify it exists) and pick the cut by size on native?
- `caption/small` at 12px collides with `caption` (12px): move `caption` up or drop `caption/small`.
- Font licenses for web and app embedding.
- Ownership of type decisions in the Figma sync — deferred to the pipeline discussion ([0004](0004-figma-sync.md)).
