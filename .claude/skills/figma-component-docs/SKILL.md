---
name: figma-component-docs
description: Generate Figma documentation for a design-system component in the Reflection Lense / "Design System Scaffolder" Figma file — a documentation frame (header with Repo/Storybook links, Preview, Anatomy with numbered markers, Slots, a Name/Default/Description props table, Do/Don't guidelines) plus a separate "Variants Matrix / <Name>" frame showing every variant. Use this whenever the user shares a Figma component or component-set link and asks to document it, write specs/annotations for it, create a spec sheet, props table, variant/state matrix or Do/Don't guidelines, or says something like "зроби документацію для компонента", "згенеруй спеки і матрицю", "document this component like the Button one" — even if they don't say "skill" or name every section.
---

# Figma component docs

Builds two frames next to a component set, in the house style the design-system owner approved
on the Button component:

1. **`Variants Matrix / <Name>`** — every variant, one variant property as columns, the rest as nested row groups.
2. **`Specs / <Name>`** — Header → Preview → Anatomy → Slots → Component properties → Guidelines,
   with dashed dividers between sections.

The look is fixed by the scripts. Your job is the content: choosing specimens, naming the anatomy
parts, writing descriptions and guidelines, then checking the result.

## Before you start

- Load the `figma:figma-use` skill (the Figma MCP requires it before any `use_figma` call), then
  `create_session` with the file key.
- The user works in **copies** of the design-system file. Style and variable names are the same,
  IDs are not. That is why `scripts/lib.js` resolves every token by name and throws if one is
  missing. If it throws, tell the user which names are missing. Don't patch in raw colors, because
  the whole point is that the docs stay bound to the file's own tokens.
- Get the component set node ID from the URL (`node-id=2025-3295` → `2025:3295`). If the link points
  to a variant or an instance, ask for the component set, or walk up to it in the inspect step.

## How to run a script

`use_figma` has no imports. Every call is **`scripts/lib.js` + one script, concatenated into a
single `code` string** (lib first). Fill in the script's `CONFIG` object at the top. Never edit
the logic below it for one-off needs, so every component gets identical structure. Read the
files fresh each time, because the user may have tuned them.

Keep return values small. The MCP transport breaks on responses over ~20k characters and on
strings cut through an emoji (surrogate pair). The scripts already return only IDs, sizes and warnings.

## Workflow

### 1. Inspect (read-only)

Run `lib.js + scripts/inspect.js` with `componentSetId`. It verifies that all tokens resolve and returns:
- `props`: every property with type, options and default. Variant properties drive the matrix and
  the props table. TEXT, BOOLEAN, SLOT and INSTANCE_SWAP properties also go in the table.
- `structure`: element names inside the default variant. These are the `node` values for anatomy
  and slot markers.
- `existingDocFrames`: docs or matrices already on the page. If one exists for this component, ask
  whether to rebuild it next to the old one or skip. Delete an old frame only when the user says so.

Also check the repo for an implementation (`src/components/<name>/`). If one exists, its prop names
and JSDoc are better material for descriptions than guesses.

### 2. Draft the content

Write both CONFIGs. `references/button-example.md` is a complete, approved example: read it for
the expected depth and tone. Guidance for each part:

- **Matrix**: `columns` is the variant property that changes width the most (usually Size).
  `rows` lists the rest, outermost first. Put the property with the fewest visual differences
  outermost (State for Button). Every variant property should appear, otherwise those variants
  are missing from the matrix.
- **Preview**: a hero, not a catalogue. Show only a few specimens (about 3–6, in one or two
  short rows): the default plus the key variants or states that tell the component apart. Never
  enumerate every state or option, because the matrix already shows all of them. For Radio Control
  the owner wanted just unchecked / checked / disabled. The script renders the same rows twice,
  in a Light and a Dark panel (the `Theme` collection pinned per panel, see `THEME` in `lib.js`),
  so pick specimens that read well in both.
- **Anatomy**: skip it (`anatomy: null`) for primitive atoms whose structure is a single shape plus
  an indicator (radio control, checkbox box, switch knob, dot, divider). Numbered markers on a
  20 px circle add nothing. Include it when users compose distinct parts: label, slots, icons,
  helper text, counters. Use one layout per structurally different configuration (e.g. "With slots" / "Text only"
  via boolean props). Items point at element names from `structure`. Mark the elements the
  component cannot exist without as `mandatory: true`. The list renders them as "Mandatory <label>",
  so give those a lowercase label. Alternate `side: 'top'` / `'bottom'` for neighbouring markers
  so the dots don't collide.
- **Slots**: only if the component has SLOT or INSTANCE_SWAP properties. Otherwise set `slots: null`.
  Use pill markers on each slot, and no "slot options" panel (the owner removed it).
- **Component properties**: one short, practical sentence for each property in `docs`: what it
  does and when to pick which option. Add `required: true` for content the component can't do
  without (like a label). The section links to `Variants Matrix / <Name>` automatically; set
  `matrixFrameName` only if the matrix was given another name. Keep the component name in both
  frame names: several components share a page, and a bare "Specs" would make the link ambiguous. Don't visualise
  options with component instances here: the owner wants a text table (Name | Default |
  Description with code chips), like Primer's props tables.
- **Guidelines**: these are product rules, so they must come from the user, the component
  description, or an existing doc. If you have none, propose 2–3 concrete rules and ask the user
  to confirm before building. Each rule needs a Do and a Don't specimen set that actually shows
  the difference (e.g. gap 8 vs 4, Accent + Neutral vs Accent + Accent).

### 3. Build

1. `lib.js + scripts/build-matrix.js` first, so the doc can link to it.
2. `lib.js + scripts/build-doc.js`. It warns if the matrix frame isn't found and returns
   `undocumentedProps` if any property is missing a description. Fill those in and rebuild rather
   than shipping empty cells.

Both frames default to free space on the right of the page. Pass `position` to place them
deliberately, e.g. doc and matrix side by side (doc is 1472 wide; leave ~200 px between frames).

### 4. Verify

Take one screenshot of each frame (`get_screenshot`, maxDimension ~2400 for the doc). Look for:
- markers that don't point at their element, or dots overlapping each other or the component;
- wrapped or clipped text in chips, badges and table cells;
- empty matrix cells (a variant combination that doesn't exist; fine if real, but say so);
- specimens showing placeholder text where the guideline needs real labels.

Fix with a targeted `use_figma` edit, or adjust CONFIG and rebuild. If you rebuild, delete the frame
you just created first; it's yours, so no need to ask. Take one more screenshot after a fix, then stop.

### 5. Report

Tell the user, in their language, what was built (frame names and node IDs), any warnings, empty
matrix cells or undocumented props, and that the Repo/Storybook cards are placeholders unless
links were given.

## House style (encoded in the scripts — for reference when fixing by hand)

| Element | Rule |
|---|---|
| Doc frame | 1472 wide, `bg/neutral/emphasized/emphasized` (same as the matrix), radius 32; header/content side padding 96 |
| Section | padding-top 64, gap 32, title `Heading/Large`, description `Body/Default` + `fg/neutral/subtle` |
| Divider | dashed line (4/4), `stroke/neutral/subtle` at 16 % opacity, 64 px top padding |
| Preview | two equal panels, Light and Dark (`setExplicitVariableModeForCollection` on the `Theme` collection), `bg/neutral/neutral` fill, theme name as a caption in the top-left corner |
| No eyebrows | no overline/eyebrow captions above titles ("02 / COLOR FOUNDATIONS"-style), and no filler summary under the page title that only restates the section list. The owner hates both. Every line of text must say something the sections don't |
| Clipping | frames that wrap instances (preview rows, cards, matrix cells) never clip content, because instances cast shadows and focus rings. Only the doc root and the props table clip |
| Token names | every variable name shown in a doc uses `tokenChip()` from `lib.js` (reference chip: node 2483:13055 on "02. Typography"): mono 12 px, `bg/neutral/neutral` fill, `stroke/neutral/neutral` at 24 %, padding `spacing/1`/`spacing/2`, radius `radius/sm`. Colors get a 12 px square swatch: one frame whose fill is the variable, with no child layers. Translucent values also get the transparency grid as a tiled PNG image fill underneath, never vector cells (call `finishSwatches()` at the end of the script). Other types get a glyph: `#` number, `Aa` string, `◐` boolean. Plain code chips (`Code/Small` on `bg/neutral/subtle`) are for things that aren't variables: prop types, defaults, name segments, CSS |
| 2-col row | 296 px description · 40 px gap · example panel (`surface/neutral`, radius 8, padding 48) |
| Borders | `stroke/neutral/subtle` at 16 % paint opacity |
| Mandatory / slot markers | `bg/info/subtle` + `stroke/info/emphasized`; optional markers `bg/neutral/subtle` |
| Props table | header `bg/neutral/subtle`; Name 240 · Default 160 · Description; code chips `Code/Small` on `bg/neutral/subtle` |
| Do / Don't | card `bg/neutral/neutral`, specimens directly in the card, badge absolutely positioned at the top (success / danger at 24 %) |
| Matrix frame | separate frame, `bg/neutral/emphasized/emphasized`, radius 32. Specimens sit in one continuous dashed grid (10/5, `stroke/neutral/neutral`), with no gaps or solid rules between groups. Row groups get a label + "[" bracket inset 10 px; leaf labels are right-aligned against the grid; the column property sits above a top bracket |

Text styles are the `Agent Harness/*` ones listed at the top of `lib.js` (note the real style name
`Body/Deafault/Default`). To change a token or style, edit the name maps in `lib.js` rather than
individual scripts.
