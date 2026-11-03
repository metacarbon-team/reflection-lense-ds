# 0023. Export all modes together

- Status: Accepted
- Date: 2026-11-03
- Extends: [0022](0022-dtcg-export.md)

## Decision

Theme Lab's Tokens tab supports both selected-mode export and an **All modes** scope for copying or downloading one DTCG JSON document.

The public `toDtcgAllModes` adapter uses ordinary DTCG groups:

- `light` and `dark` contain each mode's semantic colors and shadows.
- `font/desktop` and `font/mobile` contain their size and computed line-height scales.
- `font/family` contains shared font families once.

The combined filename is `reflection-all-modes.tokens.json`. All values use current Theme Lab settings. Selected-mode exports keep their existing structure and filenames.

## Consequences

Every mode is available in one copy operation without overwriting tokens with the same semantic name. Mode names are grouping conventions, not automatic mode-switching metadata; consumers select the groups they need. Existing scope limitations in ADR 0022 remain unchanged.
