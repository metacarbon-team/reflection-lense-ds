import type { ReactNode } from 'react'

/** Whether a slot has something to render. `0` counts as content; `undefined`, `null`, `false` and `''` do not. */
export const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''
