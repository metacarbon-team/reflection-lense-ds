import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { CloseIcon } from '../../lib/icons'
import { Card } from '../card/card'
import { IconButton } from '../icon-button/icon-button'

// The tint and the stroke come from Card; the leading icon takes the tone color here. The box is one
// title line high, so the icon centers on it.
const inlineAlertLeadingVariants = cva('flex h-5 shrink-0 items-center justify-center [&_svg]:size-4', {
  variants: {
    tone: {
      default: 'text-neutral',
      success: 'text-success',
      warning: 'text-warning',
      danger: 'text-danger',
      info: 'text-info',
    },
  },
  defaultVariants: { tone: 'default' },
})

export type InlineAlertProps = Omit<ComponentProps<'div'>, 'title'> &
  Omit<VariantProps<typeof inlineAlertLeadingVariants>, 'tone'> & {
    /** Sets the card tint, the stroke and the icon color. Use `default` for general notes, `info` for news, `success` for a finished action, `warning` for a risk and `danger` for a failure. */
    tone?: 'default' | 'success' | 'warning' | 'danger' | 'info'
    /** One short line that makes sense even if nothing else is read. A long title is cut off with an ellipsis. */
    title: ReactNode
    /** One or two lines of detail or the next step. Leave it out when the title says everything. */
    description?: ReactNode
    /**
     * A 16px icon before the title, usually matching the tone. Leave it out to hide the icon; without it
     * the tone shows only by color, so an icon is recommended. In Figma this is an icon swap and cannot be hidden.
     */
    leadingSlot?: ReactNode
    /**
     * Shows the close button on the right edge and runs when it is pressed. Leave it out when the alert
     * cannot be dismissed. The alert does not move focus: when the page removes it, put focus where the
     * user was working.
     */
    onDismiss?: () => void
    /** Accessible name of the close button. */
    dismissLabel?: string
  }

/**
 * Inline Alert: a short message that sits in the page and tells the user about a state or a result.
 * The tone sets the card tint, the stroke and the icon color. Width fills the container, height
 * follows the text.
 */
export function InlineAlert({
  className,
  tone = 'default',
  title,
  description,
  leadingSlot,
  onDismiss,
  dismissLabel = 'Dismiss',
  ...props
}: InlineAlertProps) {
  return (
    <Card
      data-slot="inline-alert"
      tone={tone}
      padding="md"
      // Warnings and errors interrupt a screen reader; the rest wait for a pause.
      role={tone === 'warning' || tone === 'danger' ? 'alert' : 'status'}
      className={cn('w-full min-w-0 animate-rise-in gap-0 motion-reduce:animate-none', className)}
      {...props}
    >
      <div className="flex min-w-0 items-start gap-2">
        {hasContent(leadingSlot) ? (
          <span data-slot="inline-alert-leading" className={inlineAlertLeadingVariants({ tone })}>
            {leadingSlot}
          </span>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <span data-slot="inline-alert-title" className="truncate text-body-small-medium text-neutral">
            {title}
          </span>
          {hasContent(description) ? (
            <span data-slot="inline-alert-description" className="text-body-xsmall text-neutral-subtle">
              {description}
            </span>
          ) : null}
        </div>
        {onDismiss ? (
          <IconButton
            data-slot="inline-alert-dismiss"
            tone="default"
            size="sm"
            variant="ghost"
            aria-label={dismissLabel}
            onClick={onDismiss}
            className="-m-2 shrink-0"
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </div>
    </Card>
  )
}
