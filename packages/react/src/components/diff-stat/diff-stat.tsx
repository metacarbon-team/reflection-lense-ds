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

export type DiffStatProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Number of added lines. The component writes it with a leading `+`. */
  added?: number
  /** Number of removed lines. The component writes it with a leading `−`; pass it without a sign. */
  removed?: number
  /** Shows the added count. Turn it off for a change that only removes lines. */
  showAdded?: boolean
  /** Shows the removed count. Turn it off for a change that only adds lines. */
  showRemoved?: boolean
}

/**
 * Diff Stat: a compact count of added and removed lines, shown next to a file or a change. Added is
 * green, removed is red. Pass plain numbers: the component writes the sign and the exact count, so the
 * meaning never depends on color alone.
 */
export function DiffStat({ className, added, removed, showAdded = true, showRemoved = true, ...props }: DiffStatProps) {
  return (
    <span
      data-slot="diff-stat"
      className={cn('inline-flex items-center gap-1.5 text-caption tabular-nums', className)}
      {...props}
    >
      {showAdded && added !== undefined ? (
        <span className={diffStatVariants({ kind: 'added' })}>+{countFormat.format(Math.abs(added))}</span>
      ) : null}
      {showRemoved && removed !== undefined ? (
        <span className={diffStatVariants({ kind: 'removed' })}>−{countFormat.format(Math.abs(removed))}</span>
      ) : null}
    </span>
  )
}
