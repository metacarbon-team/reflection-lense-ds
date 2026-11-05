# 0032. Components styled with Tailwind v4 on a Style Dictionary theme

- Status: Accepted
- Date: 2026-11-05
- Extends: [0001](0001-token-architecture.md), [0022](0022-dtcg-export.md)

## Context

The styling approach of `@reflection/react` was left open. The token contract is already fixed: the DTCG export from Theme Lab is the only output of the system ([0001](0001-token-architecture.md), [0022](0022-dtcg-export.md)), and every platform artifact is built from it. Scales and type steps already follow Tailwind v4 ([0029](0029-tailwind-v4-dimensions-in-rem.md), [0030](0030-type-scale-and-text-roles.md), [0031](0031-tailwind-tracking.md)). Runtime custom themes must keep working, so components cannot bake color values in.

## Decision

### Pipeline

1. Theme Lab exports DTCG tokens (all modes, [0023](0023-all-modes-export.md)). The file is committed as downloaded: `packages/theme/tokens/reflection.tokens.json`.
2. Style Dictionary (`packages/theme/build.ts`, `pnpm theme`) builds `@reflection/theme`:
   - `theme.css` — the Tailwind v4 theme, below;
   - `tw-merge.js` — the `tailwind-merge` extension with the theme's own class names (text roles, shadows);
   - `fonts.css` with the font files of the theme families is shipped next to it.
3. Other stacks add their own Style Dictionary platforms to the same build; they never read the generator.

### `theme.css`

- **Variables keep the canonical names** (`bg/accent/hover` → `--bg-accent-hover`, ADR 0001), so a runtime theme sets the same variables. Shared primitives sit on `:root`; colors, shadows and the focus ring on `:root, [data-mode='light']` and `[data-mode='dark']`, which also gives local modes ([0017](0017-semantic-surface-usage.md)).
- **Tailwind namespaces only reference them**, in `@theme inline reference`: utilities inline `var(--bg-accent)` and Tailwind emits no variables of its own. Every namespace it fills is reset first, so the stock palette, type scale, radii and shadows are gone.

| Tokens                                              | Tailwind namespace                            | Utility                                            |
| --------------------------------------------------- | --------------------------------------------- | -------------------------------------------------- |
| `bg/*`                                              | `--background-color-*`                        | `bg-accent`, `bg-neutral-subtle-hover`             |
| `surface`, `form/*`, `card/*`, `ghost/*`            | `--background-color-<group>-*`                | `bg-surface`, `bg-card-neutral`                    |
| `fg/*`                                              | `--text-color-*`                              | `text-neutral-subtle`, `text-accent-on-emphasized` |
| `stroke/*`                                          | `--border-color-*`                            | `border-neutral`, `divide-accent-subtle`           |
| `shadow/<level>`, `focus/ring`                      | `--shadow-*`                                  | `shadow-md`, `focus-visible:shadow-focus-ring`     |
| `spacing/1`                                         | `--spacing` (multiplier)                      | `p-4`, `gap-0.5`                                   |
| `size/<name>`                                       | `--container-*`                               | `max-w-md`                                         |
| `radius/*`                                          | `--radius-*`                                  | `rounded-lg`                                       |
| `font/family/*`, `font/weight/*`, `font/tracking/*` | `--font-*`, `--font-weight-*`, `--tracking-*` | `font-mono`, `font-medium`, `tracking-tight`       |
| `font/size/*` + `font/line-height/*`                | `--text-*`, `--text-*--line-height`           | `text-base`                                        |
| `typography/<viewport>/<style>`                     | `@utility text-<style>`                       | `text-body`, `text-heading-large`                  |

- **Text roles** set family, size, line height, weight and tracking (plus underline or uppercase). The mobile step is the default; the desktop step applies from `48rem`, Tailwind's `md`.
- Border widths stay Tailwind's built-in `border`, `border-2`, `border-4`: they match `border/width/*`.

### Components

- `@reflection/react` styles components with Tailwind utility classes against that theme. Only theme utilities are used: no arbitrary values (`bg-[#…]`, `p-[13px]`).
- Variants via `cva`; classes joined with `cn = twMerge(clsx(…))`, so a consumer's `className` overrides a component class of the same property instead of depending on CSS order.
- `tailwindcss` v4 is a peer dependency. The library ships class names, not CSS: the consumer imports the theme stylesheet and adds the library's `dist` as a Tailwind `@source`.
- Storybook builds with the same theme stylesheet and is the showcase and documentation of the library.
- Consumer setup: `@import 'tailwindcss'; @import '@reflection/theme/theme.css'; @import '@reflection/theme/fonts.css';` and `data-mode` on the root or any subtree.

## Alternatives considered

- **Plain CSS shipped with the library** — a second hand-written mapping from tokens to properties next to the Style Dictionary output.
- **CSS Modules** — the same mapping, plus hashed names that consumers cannot reuse.
- **CSS-in-JS** — runtime cost and no React Server Components support.
- **`cn` without `tailwind-merge`** — `cn('px-4', 'px-2')` keeps both classes and the winner depends on stylesheet order.

## Consequences

- One mapping from tokens to CSS, generated, not hand-written.
- Consumers of the components need Tailwind v4. Stacks without Tailwind use the tokens through their own Style Dictionary platform, not the components.
- `tailwind-merge` must know the theme's own names: the build generates that list, so `cn('text-body', 'text-heading')` keeps one role and `cn('text-body', 'text-neutral')` keeps both.
- Tailwind's spacing multiplier also allows steps outside [0029](0029-tailwind-v4-dimensions-in-rem.md) (`p-13`); keeping to the listed steps is a review rule, not enforced by the theme.
- The `dist` of `@reflection/theme` is built, not committed: `pnpm dev`, `typecheck` and `build-storybook` build it first.

## Open questions

- Color utilities outside the table (`fill-*`, `stroke-*`, `outline-*`, `ring-*`) are added when a component needs them. Placeholders use `placeholder:text-*`.
- Light or dark from `prefers-color-scheme` is left to the product: the theme switches on `data-mode` only.
