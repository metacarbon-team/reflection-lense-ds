# 0022. DTCG export from Theme Lab

- Status: Accepted
- Date: 2026-11-03
- Extends: [0001](0001-token-architecture.md)
- Scope extended and typography units changed by [0029](0029-tailwind-v4-dimensions-in-rem.md): the export includes dimension scales, and `font/size` and `font/line-height` are in rem.
- Typography structure superseded by [0030](0030-type-scale-and-text-roles.md): one type scale and `typography` composites per viewport.

## Decision

Theme Lab exports a resolved snapshot using the [DTCG Format Module 2025.10](https://www.designtokens.org/tr/2025.10/format/). The pure `toDtcg` adapter is public in `@reflection/tokens`.

- Each `.tokens.json` file contains one selected color mode (Light or Dark) and type viewport (Desktop or Mobile). Mode selection is explicit in the UI and filename; the file does not use a proprietary modes extension.
- Semantic colors come from the active Role steps output. Colors use sRGB components and explicit alpha, preserving translucent values.
- Canonical slash-separated paths become nested groups. If a token also has descendants (for example `bg/neutral` and `bg/neutral/hover`), its base value is stored in the group's reserved `$root` token. No object is both a token and a group.
- Shadows include both contact/ambient color tokens and composite `shadow` tokens. Composite values preserve layer order, pixel geometry, negative spread and mode-specific opacity.
- Typography includes `font/size/*`, computed `font/line-height/*` dimensions in px, and the font families from ADR 0006 as amended by ADR 0020. Computed line heights are distinct from leading multipliers; these primitives are not composite semantic text styles.
- Export values respond to current generator, shadow and typography settings. Generator settings remain separately available as configuration JSON.

## Current scope

The export covers implemented semantic colors, shadow tokens and typography primitives. It does not claim to include palette aliases, composite text styles, or the pending spacing/size/radius exports from ADR 0021. Theme Lab states the missing dimension scales next to the export controls.

## Consequences

Consumers can download or copy a portable token snapshot without depending on Theme Lab configuration or custom mode metadata. Consumers reading nested tokens must support DTCG 2025.10 `$root` semantics. Platform CSS conversion and native artifacts remain separate adapters.
