# 0018. Round line height to the nearest grid point

- Status: Accepted
- Date: 2026-11-03
- Clarifies: line-height grid rounding in [0006](0006-typography.md)

## Context

Always rounding line height upward adds unnecessary space: 14px body text at 1.5 becomes 24px instead of staying near its calculated 21px. The vertical grid should remain 4px.

## Decision

Round `fontSize × leading` to the nearest multiple of 4px. Round down when the lower grid point is closer, up when the upper point is closer, and up on an exact tie: `21 → 20`, `23 → 24`, `22 → 24`.

The same rule applies to fixed and modular sizes in Desktop and Mobile. Default leading is calibrated to **1.25 for both body and headings**. Font sizes and role assignment stay unchanged; the two leading controls remain independently adjustable.

## Consequences

Line heights remain on the 4px grid, at most 2px from their calculated value. Some styles become more compact; existing layouts may become shorter.
