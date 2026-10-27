# 0001. Token architecture and source of truth

- Status: Accepted
- Date: 2026-10-28
- Supersedes: —

## Context

Reflection is a range of products built on different stacks: web and native (native stacks are not known yet). All of them must share one visual language, fed from a single source of truth, with:

- custom themes created from seed hex values at **runtime**, in light and dark modes;
- guaranteed minimum accessibility (WCAG 2.2 AA) for every theme, including user-provided ones;
- a Figma library where designers make decisions and push them to the source of truth.

## Decision

### Source of truth

The source of truth is this git repository. Tokens are stored in the W3C Design Tokens Community Group (DTCG) format. Figma is an editor and a consumer, never the source of truth (sync rules: [0004](0004-figma-sync.md)).

### Layers

| Layer                | Contains                                                                  | Changed by                                                        |
| -------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Seeds / theme config | `bg`, `fg`, `accent` hex per mode ([0003](0003-palette-generation.md))    | designers (Reflection brand), products (custom themes at runtime) |
| Generated palette    | Colors solved by the generator for a theme × mode                         | generator only                                                    |
| Semantic tokens      | Public API, named by the grammar in [0002](0002-semantic-color-naming.md) | PR only — this is the contract                                    |
| Scales               | Spacing, size, radius ([0005](0005-dimension-scales.md))                  | PR                                                                |

**There are no component tokens.** Components consume semantic tokens directly. When semantics are not enough, the grammar is extended (a new role, context or state), never a `button/*`-style token.

### Generator

- A pure, deterministic TypeScript function: seeds in, resolved semantic values plus an adjustment report out. No DOM, no heavy dependencies — it runs in products at runtime and in CI for the Reflection brand.
- The algorithm is specified in the contract together with **test vectors** (fixed seeds → expected output). Any port (native, backend) must pass them.
- Until native ports exist, native apps receive a resolved **theme payload** (JSON, validated by a published JSON Schema) instead of computing colors.

### Platform contract

- One build produces every platform artifact from the same tokens.
  - Web: CSS custom properties scoped by `[data-theme]` and `[data-mode]`, TypeScript constants and a union type of semantic token names, JSON.
  - Native: artifacts are defined once the stacks are known; they follow the same names and the theme payload schema.
- Platform names are generated, never hand-written ([0002](0002-semantic-color-naming.md)).
- The React library references CSS custom properties only, never raw values.

### Versioning

Semantic versioning per package:

- **patch** — a value changes, meaning does not;
- **minor** — a token is added;
- **major** — a semantic token is renamed or removed, or moves between opacity classes ([0002](0002-semantic-color-naming.md)). The old name stays as a deprecated alias for one major version.

## Alternatives considered

- **Figma as source of truth** — no review or versioning, and runtime custom themes cannot live in Figma at all.
- **Component tokens** — rejected: one semantic layer is the only public API.
- **Generator re-implemented per platform without shared test vectors** — guaranteed drift between platforms.
- **Build-time-only custom themes** — rejected: products need runtime themes.

## Consequences

- Tokens become their own package next to the React library, so the repository moves to a pnpm workspace when token work starts.
- Every theme a product can show — including user-provided seeds — goes through the same generator and validator, so accessibility holds by construction.
- The semantic layer must be designed carefully: every new token is a contract change.

## Open questions

- Native stacks (SwiftUI / Compose / others) and their artifact formats.
- Where the generator runs for native until ports exist (backend endpoint vs bundled payloads).
- Typography, shadows/elevation and motion tokens are not covered yet.
