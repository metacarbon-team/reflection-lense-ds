---
name: token-usage-audit
description: Audit how Reflection Lense components use color tokens: bindings, token scope versus layer, opacity, text/fill pairing, variant states (hover, pressed, disabled, focus), rendered contrast and shadows. Use this skill whenever the user wants to check, validate, lint, review or audit token usage, variable bindings or colors of components in the Figma design-system file, to find where colors broke after a token migration, rebind, or palette change, or asks "які компоненти юзають не ті токени", "перевір токени в компонентах", "де поламались кольори". Also use it before shipping a component change to Figma, and later for the same checks on the React library (see references/frontend.md). Read-only by default; it proposes fixes and applies them only after the user approves.
---

# Token usage audit

Checks how **components** use color tokens. It reads the file, reports by severity and component, proposes a rebinding, and changes nothing until the user says so.

Scope is component token usage only. Documentation frames around the components (headers, spec lines, explicit Light/Dark modes on doc frames, how many themes a page shows) belong to the documentation skill. The script audits only `COMPONENT_SET`, `COMPONENT` and `INSTANCE` subtrees, but it still reads the surrounding doc frames as the background a component sits on.

The token grammar and the decisions behind every rule are in `docs/adr` (0002 naming, 0008 disabled, 0011 emphasized, 0012 text prominences, 0010 shadows). The rule catalogue with rationale and fixes is in [references/rules.md](references/rules.md). Read it before explaining a finding or proposing a fix.

## Workflow

1. **Load `figma-use`** before any `use_figma` call. It is mandatory and covers the API pitfalls.
2. **Pick the pages.** If the user gave a node or page link, use its page. Otherwise list the pages with a small `use_figma` call (`figma.root.children.map(p => [p.id, p.name])`) and audit the component pages. Large pages take a while, so run one to three pages per call.
3. **Run the audit.** Read [scripts/figma-audit.js](scripts/figma-audit.js), replace `__PAGE_IDS__` with an array of page ids (`['2024:3305']`, or `[]` for every page), and pass the whole text as `code` to `use_figma`. Change nothing else, so results stay comparable between runs. The script returns `{ pages, nodes, errors, warnings, rules: [{ rule, title, errors, warnings, items: [{ severity, detail, count, suggestion, examples }] }] }`. `count` is the number of distinct source layers: instances of one component layer count once.
4. **Report.** Lead with one line of totals, then a table per rule (errors before warnings), then the findings grouped by component set, with the example node ids. Say plainly which findings are certain (errors) and which need a designer's judgment (warnings), and name the known exceptions from rules.md where they apply. Do not pad the report with rules that found nothing.
5. **Propose fixes.** For each fixable finding, give a rebinding map: `layer (component › variant) — from → to`. Take the replacement from the grammar and the rule's fix in rules.md. Never invent a token outside the grammar, and never pick a color by hand. Where the right token is unclear (a warning), ask instead of guessing.
6. **Apply only after an explicit OK**, one batch per component set. Then re-run step 3 on the same pages and report the before/after totals.

## Applying fixes in Figma

- Rebind with `figma.variables.setBoundVariableForPaint(paint, 'color', variable)` on a paint whose `opacity` already equals the token's resolved alpha (`variable.resolveForConsumer(node).value.a`), and write the new paints array back. The alpha then stays linked to the variable and follows the mode (Light 3.5%, Dark 3.1% for `bg/disabled`).
- **Never bind a paint at opacity 1 to a translucent token, and never set a bound paint's opacity to 100% by hand.** Figma renders `paint.opacity`, so `fg/disabled`, `bg/disabled`, `ghost/*` or `stroke/*` then render opaque. Rebinding the same token over such a paint does not fix it; only a paint built at the token's alpha does. A6a reports this.
- Fix the main component first. Instance overrides (`instance.overrides`) only need a fix where the instance overrides the same field.
- Instance sublayer ids (`I<instance>;<source>`) become invalid after a write to the instance, so re-fetch nodes by id between passes.
- Load each page with `page.loadAsync()` before reading or writing it.

## Severity

- **error**: the token is wrong by a rule the ADRs fix (a deleted or primitive binding, text on the wrong pairing, disabled not on the disabled set, opacity that changes what renders, contrast below the floor). Fix it.
- **warning**: likely wrong, but legitimate exceptions exist (a layer opacity for an animation frame, an fg-filled indicator, an outline control's hover). Show it, and let the designer decide.

## Front end

The same rules apply to the React library later. The planned adapters (stylelint/ESLint on CSS variables and `cva` classes, a Playwright contrast pass on Storybook, CI) are in [references/frontend.md](references/frontend.md). Nothing there is built yet, so do not claim those checks exist.
