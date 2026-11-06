import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/** Classes of the two counts: the same caption text, green for added lines and red for removed ones. */
export const diffStatVariants = cva('whitespace-nowrap', {
  variants: {
    kind: { added: 'text-success', removed: 'text-danger' },
  },
})

export type DiffStatProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** Number of added lines, written with a leading plus sign (`+42`). */
  added?: string
  /** Number of removed lines, written with a leading minus sign (`−8`). */
  removed?: string
  /** Shows the added count. Turn it off for a change that only removes lines. */
  showAdded?: boolean
  /** Shows the removed count. Turn it off for a change that only adds lines. */
  showRemoved?: boolean
}

/**
 * Diff Stat: a compact count of added and removed lines, shown next to a file or a change. Added is
 * green, removed is red. Always write the sign and the exact number, so the meaning never depends on color alone.
 */
export function DiffStat({ className, added, removed, showAdded = true, showRemoved = true, ...props }: DiffStatProps) {
  return (
    <span
      data-slot="diff-stat"
      className={cn('inline-flex items-center gap-1.5 text-caption tabular-nums', className)}
      {...props}
    >
      {showAdded ? <span className={diffStatVariants({ kind: 'added' })}>{added}</span> : null}
      {showRemoved ? <span className={diffStatVariants({ kind: 'removed' })}>{removed}</span> : null}
    </span>
  )
}
