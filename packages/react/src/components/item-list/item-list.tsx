import { cva } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/** Plain is the bare column. Card puts it on the card surface with a stroke, a radius, a small shadow and 4 px of padding. */
const itemListVariants = cva('flex w-full min-w-0 flex-col', {
  variants: {
    variant: {
      plain: '',
      card: 'overflow-clip rounded-xl border border-neutral-subtle bg-card-neutral-emphasized p-1 shadow-xs',
    },
  },
  defaultVariants: { variant: 'plain' },
})

export type ItemListProps = ComponentProps<'div'> & {
  /** Plain is the bare list on the background it sits on. Card puts the list on its own surface with a border and radius. */
  variant?: 'plain' | 'card'
}

/**
 * ItemList: a column for `Item` rows. Drop the rows in as children and the list brings the padding
 * and the card surface. It is a plain `div`: give it a `role` (`list`, `radiogroup`) when the rows
 * need one.
 */
export function ItemList({ className, variant = 'plain', ...props }: ItemListProps) {
  return <div data-slot="item-list" className={cn(itemListVariants({ variant }), className)} {...props} />
}
