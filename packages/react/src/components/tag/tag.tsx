import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'

/**
 * Tag: a small read-only label for categories, statuses and metadata. A raised tag on the form surface;
 * the tone is carried by a colored dot, and `default` has no dot. Size sets the height (16, 20, 24 px)
 * and the slot icon size (12, 16, 16 px).
 */
const tagVariants = cva(
  [
    'inline-flex shrink-0 items-center gap-1 whitespace-nowrap',
    'border border-neutral-subtle bg-form-neutral text-label-small text-neutral shadow-xs',
  ],
  {
    variants: {
      size: {
        sm: 'h-4 rounded-sm px-1 [&_svg]:size-3',
        md: 'h-5 rounded-md px-1.5 [&_svg]:size-4',
        lg: 'h-6 rounded-md px-2 [&_svg]:size-4',
      },
    },
    defaultVariants: { size: 'sm' },
  },
)

const dotVariants = cva('size-1.5 shrink-0 rounded-full', {
  variants: {
    tone: {
      default: 'hidden',
      success: 'bg-success-emphasized',
      warning: 'bg-warning-emphasized',
      danger: 'bg-danger-emphasized',
      info: 'bg-info-emphasized',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type TagProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** The color of the dot: neutral (no dot), green, orange, red or blue. Pick the one that matches the meaning. */
  tone?: VariantProps<typeof dotVariants>['tone']
  /** Large is 24 px, medium 20 px, small 16 px. */
  size?: VariantProps<typeof tagVariants>['size']
  /** The tag text. Always shown. */
  children: ReactNode
  /** Content before the label, usually a small icon. Shown only when set. */
  leadingSlot?: ReactNode
  /** Content after the label, such as a close icon or a count. Shown only when set. */
  trailingSlot?: ReactNode
}

/**
 * Tag: a small read-only label for categories, statuses and metadata. A raised tag on the form surface;
 * the tone is carried by a colored dot, and `default` has no dot.
 */
export function Tag({ className, tone, size, leadingSlot, trailingSlot, children, ...props }: TagProps) {
  return (
    <span data-slot="tag" className={cn(tagVariants({ size }), className)} {...props}>
      <span data-slot="tag-dot" aria-hidden="true" className={dotVariants({ tone })} />
      {hasContent(leadingSlot) ? (
        <span data-slot="leading-slot" className="inline-flex shrink-0 items-center justify-center overflow-clip">
          {leadingSlot}
        </span>
      ) : null}
      {children}
      {hasContent(trailingSlot) ? (
        <span data-slot="trailing-slot" className="inline-flex shrink-0 items-center justify-center overflow-clip">
          {trailingSlot}
        </span>
      ) : null}
    </span>
  )
}
