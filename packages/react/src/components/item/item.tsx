import { cva } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Size sets the row padding and the text roles of its parts. Hover, pressed and focus-visible come
 * from the browser in `default`; the `hover`, `pressed` and `focus` states freeze them for docs and
 * tests. `active` marks the current row. Colors of a disabled row come from `group-data-disabled`
 * on each part.
 */
const itemVariants = cva('group/item relative flex w-full min-w-0 flex-col justify-center rounded-md outline-none', {
  variants: {
    size: {
      sm: 'px-3 py-1',
      md: 'px-4 py-1.5',
      lg: 'px-4 py-3',
    },
    state: {
      default: 'hover:bg-ghost-neutral-hover active:bg-ghost-neutral-pressed focus-visible:shadow-focus-ring',
      hover: 'bg-ghost-neutral-hover',
      pressed: 'bg-ghost-neutral-pressed',
      active: 'bg-neutral',
      focus: 'shadow-focus-ring',
      disabled: 'pointer-events-none',
    },
  },
  defaultVariants: { size: 'md', state: 'default' },
})

/** Text role of each part per size. The error label uses the meta role. */
const textRoles = {
  sm: { title: 'text-label-small', meta: 'text-caption', description: 'text-caption' },
  md: { title: 'text-label', meta: 'text-body-small', description: 'text-body-xsmall' },
  lg: { title: 'text-label-large', meta: 'text-body-small', description: 'text-body-small' },
} as const

// A slot is 16 × 16: the description is indented by that width, so a checkbox or radio shrinks to fit.
const slotFrame = [
  'flex min-h-4 shrink-0 items-center justify-center group-data-disabled/item:text-disabled',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_[data-slot=checkbox]]:size-4 [&_[data-slot=radio]]:size-4',
]

const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

export type ItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The row title. One line, cut with an ellipsis when it does not fit. */
  label: ReactNode
  /** Secondary text under the title. Wraps to two lines, then is cut with an ellipsis. */
  description?: ReactNode
  /** The danger message under the description. One line, cut with an ellipsis, so keep it short. */
  errorLabel?: ReactNode
  /** Short meta text on the right. It never shrinks, so keep it short: the title takes what is left. */
  metaLabel?: ReactNode
  /** Content before the title, 16 × 16: an icon, an avatar, a checkbox or a radio. The row shows the slot when it is set. */
  leadingSlot?: ReactNode
  /** Content at the end of the row, 16 × 16: a switch or buttons. The row shows the slot when it is set. */
  trailingSlot?: ReactNode
  /** Adds a thin line under the row. */
  divider?: boolean
  /** L fits a title with a description. M is tighter and fits one-line rows. S is the densest. */
  size?: 'sm' | 'md' | 'lg'
  /** Freezes `hover`, `pressed` or `focus` for docs and tests. `active` marks the current row; `disabled` blocks it. */
  state?: 'default' | 'hover' | 'pressed' | 'active' | 'focus' | 'disabled'
  /** Blocks the row and dims its text. Same as `state="disabled"`. */
  disabled?: boolean
}

/** Keeps the description and the error under the title: an empty space the width of each slot on both sides. */
function Indented({ leading, trailing, children }: { leading: boolean; trailing: boolean; children: ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      {leading && <span aria-hidden="true" className="w-4 shrink-0" />}
      <div className="min-w-0 flex-1">{children}</div>
      {trailing && <span aria-hidden="true" className="w-4 shrink-0" />}
    </div>
  )
}

/**
 * Item: one list row. A control or icon on the left, a title with a description, a meta label and
 * actions on the right. Everything but the title is optional. The row is a plain `div`: give it a
 * `role` and handlers when it is interactive.
 */
export function Item({
  label,
  description,
  errorLabel,
  metaLabel,
  leadingSlot,
  trailingSlot,
  divider = false,
  size = 'md',
  state = 'default',
  disabled = false,
  className,
  ...props
}: ItemProps) {
  const isDisabled = disabled || state === 'disabled'
  const roles = textRoles[size]
  const hasLeading = hasContent(leadingSlot)
  const hasTrailing = hasContent(trailingSlot)
  return (
    <div
      data-slot="item"
      data-disabled={isDisabled || undefined}
      aria-disabled={isDisabled || undefined}
      className={cn(itemVariants({ size, state: isDisabled ? 'disabled' : state }), className)}
      {...props}
    >
      <div className="flex items-center gap-2">
        {hasLeading && (
          <span data-slot="item-leading-slot" className={cn(slotFrame)}>
            {leadingSlot}
          </span>
        )}
        <span
          data-slot="item-label"
          className={cn('min-w-0 flex-1 truncate text-neutral group-data-disabled/item:text-disabled', roles.title)}
        >
          {label}
        </span>
        {hasContent(metaLabel) && (
          <span
            data-slot="item-meta"
            className={cn(
              'shrink-0 whitespace-nowrap text-neutral-subtle group-data-disabled/item:text-disabled',
              roles.meta,
            )}
          >
            {metaLabel}
          </span>
        )}
        {hasTrailing && (
          <span data-slot="item-trailing-slot" className={cn(slotFrame)}>
            {trailingSlot}
          </span>
        )}
      </div>
      {hasContent(description) && (
        <Indented leading={hasLeading} trailing={hasTrailing}>
          <p
            data-slot="item-description"
            className={cn('line-clamp-2 text-neutral-subtle group-data-disabled/item:text-disabled', roles.description)}
          >
            {description}
          </p>
        </Indented>
      )}
      {hasContent(errorLabel) && (
        <Indented leading={hasLeading} trailing={hasTrailing}>
          <p
            data-slot="item-error"
            className={cn('truncate text-danger group-data-disabled/item:text-disabled', roles.meta)}
          >
            {errorLabel}
          </p>
        </Indented>
      )}
      {divider && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 border-b border-neutral-subtle group-data-disabled/item:border-disabled"
        />
      )}
    </div>
  )
}
