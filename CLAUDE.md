# Reflection Lense — design system

React 19 + CVA component library. Storybook (react-vite) for docs, Vite library mode for the build. Package manager: pnpm.

## Open decisions — do not pre-empt

- **Styling approach** is not chosen (no Tailwind, no CSS-in-JS yet). Do not add a styling library or tailwind-merge without asking.
- **Token architecture** is decided in [docs/adr](docs/adr/README.md) (0001–0005): source of truth, naming grammar, opacity classes, palette generation, Figma sync, scales. Follow them; do not invent tokens outside the grammar or hand-pick colors. Changing a decision means a new ADR, not an edit.
- **shadcn/ui** is planned as a golden reference (read-only examples to reimplement from scratch), not as a dependency. Not set up yet.
- **Radix primitives** are allowed for complex behaviour (dialog, popover, focus trap, keyboard nav); styling and API are ours.

## Commands

- `pnpm dev` — Storybook on :6006
- `pnpm build` — library to `dist/` (Vite ESM bundle + `tsc` declarations)
- `pnpm build-storybook`, `pnpm typecheck`, `pnpm lint`, `pnpm format`

## Conventions

- One folder per component: `src/components/<name>/{<name>.tsx,<name>.stories.tsx,index.ts}`; re-export from `src/index.ts`.
- Variants via `cva`; join classes with `cn` from `src/lib/cn.ts`.
- Relative imports only — no path aliases (tsc-emitted `.d.ts` would keep them unresolved).
- Every dependency and peer is externalised in `vite.config.ts` automatically from `package.json`.
- TypeScript is pinned to 6.0 because typescript-eslint does not support TS 7 yet.
