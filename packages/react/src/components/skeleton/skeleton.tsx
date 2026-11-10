import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

export const skeletonVariants = cva('block shrink-0 bg-neutral-pressed', {
  variants: {
    shape: {
      text: 'h-3.5 w-40 rounded-full',
      description: 'h-2.5 w-48 rounded-full',
      block: 'size-10 rounded-md',
      circle: 'size-10 rounded-full',
    },
  },
  defaultVariants: { shape: 'text' },
})

export type SkeletonProps = Omit<ComponentProps<'div'>, 'children'> &
  VariantProps<typeof skeletonVariants> & {
    /** `text` and `description` are lines of a title and of secondary text; `block` is a square, `circle` a round shape. Pick the one that matches the final content so nothing jumps when the data arrives. */
    shape?: 'text' | 'description' | 'block' | 'circle'
  }

/**
 * Skeleton: a placeholder that keeps the shape of the content while it loads. All shapes use one
 * neutral tone and do not animate. It is hidden from assistive technology.
 */
export function Skeleton({ className, shape, ...props }: SkeletonProps) {
  return (
    <div data-slot="skeleton" aria-hidden="true" className={cn(skeletonVariants({ shape }), className)} {...props} />
  )
}

export type SkeletonItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Shows the square before the text. Turn it on when the final row has an icon or an avatar. */
  leading?: boolean
}

/**
 * Skeleton item: a ready row that copies `Item` while its content loads. It always has a title
 * line and a description line under it; the title is shorter, so the row reads as text. It fills
 * the width of its container and tells assistive technology that the content is busy loading.
 */
export function SkeletonItem({ leading = true, className, ...props }: SkeletonItemProps) {
  return (
    <div
      data-slot="skeleton-item"
      aria-busy="true"
      className={cn('flex w-full min-w-0 items-center gap-2 px-2 py-1', className)}
      {...props}
    >
      {leading && <Skeleton shape="block" className="size-8" />}
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="pr-16">
          <Skeleton className="w-full" />
        </div>
        <div className="pr-4">
          <Skeleton shape="description" className="w-full" />
        </div>
      </div>
    </div>
  )
}
