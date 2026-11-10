import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/** Classes of the two counts: green for added lines, red for removed ones. */
export const diffStatVariants = cva('whitespace-nowrap', {
  variants: {
    kind: { added: 'text-success', removed: 'text-danger' },
  },
})

/** Always the exact count with thousands separators (`1,204`), never a rounded one. */
const countFormat = new Intl.NumberFormat('en-US')

/** The text of a count, or `null` when there is nothing to show: no number, `NaN` or `Infinity`. Fractions are cut off. */
const formatCount = (count: number | undefined) =>
  count !== undefined && Number.isFinite(count) ? countFormat.format(Math.trunc(Math.abs(count))) : null

export type DiffStatProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Number of added lines, a whole number. The component writes it with a leading `+`. A value that is not finite is not shown. */
  added?: number
  /** Number of removed lines, a whole number. The component writes it with a leading `−`; pass it without a sign. A value that is not finite is not shown. */
  removed?: number
  /** Shows the added count. Turn it off for a change that only removes lines. */
  showAdded?: boolean
  /** Shows the removed count. Turn it off for a change that only adds lines. */
  showRemoved?: boolean
}

/**
 * Diff Stat: a compact count of added and removed lines, shown next to a file or a change. Added is
 * green, removed is red. Pass plain numbers: the component writes the sign and the exact count, so the
 * meaning never depends on color alone. Give it a name for screen readers with `role="group"` and an
 * `aria-label`, for example "120 lines added, 34 lines removed".
 */
export function DiffStat({ className, added, removed, showAdded = true, showRemoved = true, ...props }: DiffStatProps) {
  const addedText = showAdded ? formatCount(added) : null
  const removedText = showRemoved ? formatCount(removed) : null
  // With nothing to show, render nothing instead of an empty element.
  if (addedText === null && removedText === null) return null
  return (
    <span
      data-slot="diff-stat"
      className={cn('inline-flex items-center gap-1.5 text-caption tabular-nums', className)}
      {...props}
    >
      {addedText !== null ? <span className={diffStatVariants({ kind: 'added' })}>+{addedText}</span> : null}
      {removedText !== null ? <span className={diffStatVariants({ kind: 'removed' })}>−{removedText}</span> : null}
    </span>
  )
}
