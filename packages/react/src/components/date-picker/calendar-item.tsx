import { cva } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { disabledAttrs } from '../../lib/disabled'

/**
 * Calendar Item: a 32 × 32 date cell. Hover and focus-visible come from the browser in `default`; the
 * `hover` and `focus` states freeze them for docs and tests. `active` marks the chosen date with the accent fill.
 */
const calendarItemVariants = cva(
  [
    'flex size-8 shrink-0 items-center justify-center overflow-clip rounded-md text-body-small text-neutral outline-none select-none',
    'data-disabled:pointer-events-none data-disabled:text-disabled',
  ],
  {
    variants: {
      state: {
        default: 'not-data-disabled:hover:bg-ghost-neutral-hover focus-visible:shadow-focus-ring',
        hover: 'bg-ghost-neutral-hover',
        focus: 'shadow-focus-ring',
        active:
          'bg-accent-emphasized text-accent-on-emphasized focus-visible:shadow-focus-ring data-disabled:bg-disabled',
      },
    },
    defaultVariants: { state: 'default' },
  },
)

export type CalendarItemProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** The text of the cell: a day number or a short month name. */
  label: ReactNode
  /** Freezes `hover` or `focus` for docs and tests. `active` marks the chosen date. */
  state?: 'default' | 'hover' | 'focus' | 'active'
  /** Marks the chosen date. Same as `state="active"`. */
  selected?: boolean
  /** Blocks the date and mutes it. The cell stays focusable, so arrow keys can pass over it. */
  disabled?: boolean
}

/**
 * Calendar Item: one date of the Calendar, a day or a month. It is a `button`. A disabled cell keeps
 * focus (`aria-disabled`, not the native `disabled`), so keyboard navigation does not get stuck on it.
 */
export function CalendarItem({
  label,
  state = 'default',
  selected = false,
  disabled = false,
  type,
  className,
  onClick,
  ...props
}: CalendarItemProps) {
  const isActive = selected || state === 'active'
  // A disabled cell drops the frozen hover and focus; its look comes from `data-disabled`.
  const resolved = isActive ? 'active' : disabled ? 'default' : state
  return (
    <button
      type={type ?? 'button'}
      data-slot="calendar-item"
      data-selected={isActive || undefined}
      className={cn(calendarItemVariants({ state: resolved }), className)}
      onClick={disabled ? (event) => event.preventDefault() : onClick}
      {...props}
      {...disabledAttrs(disabled, false)}
    >
      {label}
    </button>
  )
}
