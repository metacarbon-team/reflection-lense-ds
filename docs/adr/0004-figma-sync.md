# 0004. Figma ↔ source of truth sync

- Status: Accepted
- Date: 2026-10-28
- Supersedes: —

## Context

A Figma library lives alongside the code. Designers make decisions there and push them to the source of truth ([0001](0001-token-architecture.md)); generated results must flow back so designs use the same values as products. Sync is performed by **agent workflows**, so it does not depend on the Figma plan or its REST API.

## Decision

### Ownership

Each layer has one owner, so changes never ping-pong between Figma and the repository.

| Owned by Figma (designers)              | Owned by the repository                                                                                        |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Seeds of the Reflection brand, per mode | Grammar ([0002](0002-semantic-color-naming.md)) and accessibility targets ([0003](0003-palette-generation.md)) |
| Scale and typography decisions          | Generator and every generated color                                                                            |
|                                         | Platform names and Figma `codeSyntax`, deprecations                                                            |

Generated variables are read-only in Figma: editing them there is overwritten by the next sync — change the seeds instead.

### Figma → repository

1. A designer asks for a publish.
2. An agent reads the owned variables from Figma, normalizes names ([0002](0002-semantic-color-naming.md)), writes DTCG and opens a PR.
3. CI validates grammar and opacity classes, runs the generator and the accessibility validator.
4. Review, merge, release.

### Repository → Figma

After a merge, an agent upserts generated variables into Figma:

- variables are matched by a stable key stored in the token's DTCG `$extensions` (the Figma variable id), so repeated runs are idempotent;
- nothing is hard-deleted automatically — removed tokens are hidden and marked deprecated;
- `codeSyntax` is written for every platform.

Custom runtime themes are not stored in Figma as modes. On request, an agent writes any seed set into a single preview slot so designers can check it.

### Drift check

A periodic job compares Figma with the repository and reports differences instead of fixing them silently.

## Alternatives considered

- **Figma Variables REST API from CI** — not needed: agent workflows cover both directions without depending on the Figma plan.
- **Tokens Studio or a similar paid plugin** — an extra tool and a second naming model to maintain.
- **Two-way sync of every layer** — leads to conflicts; replaced by single ownership per layer.

## Consequences

- Designers change colors through seeds, not by editing generated values.
- The repository stays reviewable: every Figma change arrives as a PR.
- Agent workflows become part of the release process and must follow this ADR exactly.

## Open questions

- Exact collection and mode layout of the Figma library.
- Who triggers a publish and how often the drift check runs.
