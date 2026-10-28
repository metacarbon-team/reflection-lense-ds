# Reflection Lense — design system

pnpm workspace:

- `packages/tokens` (`@reflection/tokens`) — color math, theme generator, validator, type scale. Pure TypeScript, no runtime dependencies.
- `packages/react` (`@reflection/react`) — React 19 + CVA component library. Storybook (react-vite) for docs, Vite library mode for the build.
- `apps/theme-lab` (`@reflection/theme-lab`) — internal tool to tune generator parameters and preview themes.

## Open decisions — do not pre-empt

- **Styling approach** of the component library is not chosen (no Tailwind, no CSS-in-JS yet). Do not add a styling library or tailwind-merge without asking.
- **Token architecture** is decided in [docs/adr](docs/adr/README.md) (0001–0006): source of truth, naming grammar, opacity classes, palette generation, Figma sync, scales, typography. Follow them; do not invent tokens outside the grammar or hand-pick colors. Changing a decision means a new ADR, not an edit.
- **Generator parameters** (ΔL steps, weight floor, status hues) are placeholders until calibrated in the Theme Lab; status hues wait for the default themes' seeds.
- **shadcn/ui** is planned as a golden reference (read-only examples to reimplement from scratch), not as a dependency. Not set up yet.
- **Radix primitives** are allowed for complex behaviour (dialog, popover, focus trap, keyboard nav); styling and API are ours.

## Commands (from the root)

- `pnpm dev` — Storybook on :6006
- `pnpm lab` — Theme Lab on :5174
- `pnpm test` — generator tests, including a randomized check that every seed set validates
- `pnpm build` — every package; the library goes to `packages/react/dist/` (Vite ESM bundle + `tsc` declarations)
- `pnpm build-storybook`, `pnpm typecheck`, `pnpm lint`, `pnpm format`

## Conventions

- One folder per component: `packages/react/src/components/<name>/{<name>.tsx,<name>.stories.tsx,index.ts}`; re-export from `packages/react/src/index.ts`.
- Variants via `cva`; join classes with `cn` from `packages/react/src/lib/cn.ts`.
- Relative imports only — no path aliases (tsc-emitted `.d.ts` would keep them unresolved).
- Every dependency and peer is externalised in `packages/react/vite.config.ts` automatically from its `package.json`.
- The validator (`packages/tokens/src/validate.ts`) stays independent of the generator: it reads names and hex values only.
- Lightness steps are measured on 8-bit colors as shipped, never on unrounded values.
- TypeScript is pinned to 6.0 because typescript-eslint does not support TS 7 yet.
