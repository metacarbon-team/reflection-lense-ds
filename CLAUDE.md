# Reflection Lense — design system

pnpm workspace:

- `packages/tokens` (`@reflection/tokens`) — color math, theme generator, validator, type scale. Pure TypeScript, no runtime dependencies.
- `packages/theme` (`@reflection/theme`) — Style Dictionary build of the committed DTCG export into the Tailwind v4 theme (`theme.css`), the `tailwind-merge` extension and the font files. `dist/` is generated.
- `packages/react` (`@reflection/react`) — React 19 + CVA component library. Storybook (react-vite) for docs, Vite library mode for the build.
- `apps/theme-lab` (`@reflection/theme-lab`) — internal tool to tune generator parameters and preview themes. Its chrome is `@reflection/react` on the default theme; Lab-only pieces without a Figma component (Slider, ColorInput, Drawer, Segmented) live in `apps/theme-lab/src/ui/lab.tsx`. It resolves workspace packages to their sources through the `source` export condition (Vite `resolve.conditions`, TS `customConditions`).

## Documentation

- The system is documented as it is today, in Storybook (`packages/react/src/docs/`): Foundations (Tokens, Color, Typography, Dimensions, Elevation and focus) and Guides (Component conventions, Composing components, Known issues). The generator's rules are in `packages/tokens/README.md`. There are no ADRs.
- Follow these pages; do not invent tokens outside the naming grammar or hand-pick colors.
- A change to tokens, the generator or a convention updates the matching page in the same change. Fixing something listed in Known issues removes it from that page.

## Open decisions — do not pre-empt

- **Generator parameters** (ΔL steps, weight floors, shadow ramp) are placeholders until calibrated in the Theme Lab. Status base colors are set (success, warning, danger, info).
- **shadcn/ui** is planned as a golden reference (read-only examples to reimplement from scratch), not as a dependency. Not set up yet.
- **Radix primitives** are allowed for complex behaviour (dialog, popover, focus trap, keyboard nav); styling and API are ours.

## Commands (from the root)

- `pnpm dev` — Storybook on :6006
- `pnpm lab` — Theme Lab on :5174
- `pnpm theme` — rebuild `@reflection/theme` after replacing `packages/theme/tokens/reflection.tokens.json` with a Theme Lab export (`dev`, `lab`, `typecheck`, `build-storybook` run it first)
- `pnpm test` — generator tests, including a randomized check that every seed set validates
- `pnpm build` — every package; the library goes to `packages/react/dist/` (Vite ESM bundle + `tsc` declarations)
- `pnpm build-storybook`, `pnpm typecheck`, `pnpm lint`, `pnpm format`

## Conventions

- One folder per component: `packages/react/src/components/<name>/{<name>.tsx,<name>.stories.tsx,index.ts}`; re-export from `packages/react/src/index.ts`.
- Components are styled with Tailwind v4 utilities on the Style Dictionary theme built from the DTCG export; theme utilities only, no arbitrary values (see Guides/Component conventions for the allowed exceptions).
- Variants via `cva`; join classes with `cn` from `packages/react/src/lib/cn.ts` (`twMerge(clsx())`).
- Relative imports only — no path aliases (tsc-emitted `.d.ts` would keep them unresolved).
- Every dependency and peer is externalised in `packages/react/vite.config.ts` automatically from its `package.json`.
- The validator (`packages/tokens/src/validate.ts`) stays independent of the generator: it reads names and hex values only.
- Lightness steps are measured on 8-bit colors as shipped, never on unrounded values.
- TypeScript is pinned to 6.0 because typescript-eslint does not support TS 7 yet.
