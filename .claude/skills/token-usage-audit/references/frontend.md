# Front-end adapter (planned, not built)

The React library (`packages/react`) will get the same rule ids, so a Figma report and a code report read alike. The styling approach is still an open decision (CLAUDE.md), so these adapters wait for it. The list records where each rule would live.

| Rule | Where it would run | How |
| --- | --- | --- |
| A1 raw-color | lint (stylelint, or ESLint on `cva` strings) | no hex, `rgb()`, `hsl()` or named colors in component styles; only `var(--<token>)` |
| A2, A3 | lint | the variable must exist in the generated token CSS and must not be a palette primitive (`--reflection-*`) |
| A5 role-mismatch | lint | property-to-scope map: `color` takes `fg-*`, `background` takes `bg-*`/`surface-*`/`ghost-*`, `border-color`/`outline-color` take `stroke-*`/`focus-*` |
| A6a, A6b | lint | no `opacity` (or alpha `color-mix`) on token-colored elements; exceptions marked inline with a reason |
| B7 pairing | lint per variant | an `on-emphasized` text class appears only together with the same role's `emphasized` background |
| B8 states | lint per variant | `:hover`/`:active` use the default token's `/hover`/`/pressed`; `:disabled`/`[aria-disabled]` use only the `disabled` set; ghost variants keep a transparent background when disabled |
| C10, C11 | Playwright on Storybook | render every story in both themes, read computed colors, composite the backgrounds and check 4.5 / 3 / 2:1 (axe-core covers part of this) |
| C12 | lint | `box-shadow` only through `--shadow-*` variables |

Run the lint rules in `pnpm lint` and the Playwright pass in CI after `pnpm build-storybook`. Report findings in the same shape as the Figma script (`rule`, `severity`, `detail`, `suggestion`, examples as `file:line` or `story › variant`).
