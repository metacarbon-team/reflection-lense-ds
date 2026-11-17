import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { IconBox } from '../icon-box/icon-box'

/**
 * Variant sets the space around the content, the gap between the parts and the text roles. `page`
 * also fills its container, so a whole empty page is centered in the space it gets.
 */
const emptyStateVariants = cva('flex min-w-0 flex-col items-center justify-center text-center', {
  variants: {
    variant: {
      inline: 'w-full gap-3 p-6',
      page: 'size-full gap-4 p-12',
    },
  },
  defaultVariants: { variant: 'inline' },
})

const titleVariants = cva('w-full text-neutral', {
  variants: { variant: { inline: 'text-label', page: 'text-label-large' } },
  defaultVariants: { variant: 'inline' },
})

export type EmptyStateProps = Omit<ComponentProps<'div'>, 'title' | 'children'> & {
  /** Where the empty state is used. `inline` fills a card or a section. `page` fills a whole empty page and adds the Icon Box. */
  variant?: VariantProps<typeof emptyStateVariants>['variant']
  /** Says what is missing, for example “No requests yet”. The block is not shown when the title is not set. */
  title?: ReactNode
  /** The second line: why it is empty or what to do next. Not shown when it is not set. */
  description?: ReactNode
  /**
   * The icon of the Icon Box above the title, for example an inbox. The empty state draws the Icon Box
   * around it. The Icon Box exists in the `page` variant only, so `inline` ignores it. Not shown when it is not set.
   */
  icon?: ReactNode
  /**
   * The call to action: one primary Button (`sm` in `inline`, `md` in `page`). Add a secondary outline
   * Button before it for a second choice. Not shown when it is not set.
   */
  action?: ReactNode
}

/**
 * Empty state: tells the user that an area has no data and, optionally, what to do about it. Use
 * `inline` inside a card or a section, and `page` when the whole page is empty. The parts are plain
 * content, not a live region: give the container a `role` if the state appears after an action.
 */
export function EmptyState({
  variant = 'inline',
  title,
  description,
  icon,
  action,
  className,
  ...props
}: EmptyStateProps) {
  const isPage = variant === 'page'
  const hasTitle = hasContent(title)
  const hasDescription = hasContent(description)
  return (
    <div data-slot="empty-state" className={cn(emptyStateVariants({ variant }), className)} {...props}>
      {isPage && hasContent(icon) && (
        <div data-slot="empty-state-icon-box" className="flex items-center justify-center">
          <IconBox icon={icon} />
        </div>
      )}
      {(hasTitle || hasDescription) && (
        <div
          data-slot="empty-state-text"
          className={cn('flex w-full flex-col items-center justify-center gap-1 break-words', isPage && 'max-w-sm')}
        >
          {hasTitle && (
            <div data-slot="empty-state-title" className={titleVariants({ variant })}>
              {title}
            </div>
          )}
          {hasDescription && (
            <p data-slot="empty-state-description" className="w-full text-body-small text-neutral-subtle">
              {description}
            </p>
          )}
        </div>
      )}
      {hasContent(action) && (
        <div data-slot="empty-state-action" className="flex items-center justify-center gap-2">
          {action}
        </div>
      )}
    </div>
  )
}
