import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cloneElement, isValidElement } from 'react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { ChevronDownIcon, ChevronRightIcon } from '../../lib/icons'
import { cn } from '../../lib/cn'

/**
 * Nav Item: a 32px row of the sidebar. Hover and focus-visible come from the browser in `default`; the
 * `hover` and `focus` states freeze them for docs and tests. `active` marks the current page.
 * A nested row is indented by one slot.
 */
const navItemVariants = cva(
  [
    'flex h-8 w-full min-w-0 items-center gap-2 rounded-md px-2 text-left text-label text-neutral outline-none select-none',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      state: {
        default: 'hover:bg-ghost-neutral-hover focus-visible:shadow-focus-ring',
        hover: 'bg-ghost-neutral-hover',
        active: 'bg-neutral focus-visible:shadow-focus-ring',
        focus: 'shadow-focus-ring',
        disabled: 'pointer-events-none text-disabled',
      },
    },
    defaultVariants: { state: 'default' },
  },
)

const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

export type NavItemProps = Omit<ComponentProps<'button'>, 'children'> & {
  /** Text of the row. One line, cut with an ellipsis when it does not fit. */
  label: ReactNode
  /** Root rows sit at the left edge. Nested rows add an indent and go under a group row. */
  level?: 'root' | 'nested'
  /** Freezes `hover` or `focus` for docs and tests. `active` marks the current page; `disabled` blocks the row. */
  state?: 'default' | 'hover' | 'active' | 'focus' | 'disabled'
  /** Marks the current page. Same as `state="active"`. Mark one row only. */
  active?: boolean
  /** Blocks the row and dims it. Same as `state="disabled"`. */
  disabled?: boolean
  /** Shows the chevron of a group row. */
  chevron?: boolean
  /** Whether the group is open. The chevron points down when open and right when closed, and the row sets `aria-expanded`. Needs `chevron`. */
  expanded?: boolean
  /** Content before the label, 16 × 16: usually an icon. The row shows the slot when it is set. */
  leadingSlot?: ReactNode
  /** Content after the label, 16 × 16. The row shows the slot when it is set. */
  trailingSlot?: ReactNode
  /** Render the only child (a link, a router link) with the row's styles and content. */
  asChild?: boolean
  /** The link to render when `asChild` is set. Its own content is replaced by the row. */
  children?: ReactElement
}

/**
 * Nav Item: one row of the sidebar navigation. An icon, a label and an optional chevron for a group
 * row. It is a `button`; with `asChild` it takes the place of a link and keeps the same look.
 */
export function NavItem({
  label,
  level = 'root',
  state = 'default',
  active = false,
  disabled = false,
  chevron = false,
  expanded = false,
  leadingSlot,
  trailingSlot,
  asChild = false,
  type,
  className,
  children,
  ...props
}: NavItemProps) {
  const isDisabled = disabled || state === 'disabled'
  const isActive = !isDisabled && (active || state === 'active')
  const resolved = isDisabled ? 'disabled' : isActive ? 'active' : state
  const Chevron = expanded ? ChevronDownIcon : ChevronRightIcon

  const content = (
    <>
      {level === 'nested' && <span aria-hidden="true" className="size-4 shrink-0" />}
      {chevron && <Chevron data-slot="nav-item-chevron" />}
      {hasContent(leadingSlot) && (
        <span data-slot="nav-item-leading-slot" className="flex shrink-0 items-center justify-center">
          {leadingSlot}
        </span>
      )}
      <span data-slot="nav-item-label" className="min-w-0 flex-1 truncate">
        {label}
      </span>
      {hasContent(trailingSlot) && (
        <span data-slot="nav-item-trailing-slot" className="flex shrink-0 items-center justify-center">
          {trailingSlot}
        </span>
      )}
    </>
  )

  const rootProps = {
    'data-slot': 'nav-item',
    'data-level': level,
    'data-disabled': isDisabled || undefined,
    'aria-current': isActive ? ('page' as const) : undefined,
    'aria-expanded': chevron ? expanded : undefined,
    'aria-disabled': isDisabled || undefined,
    className: cn(navItemVariants({ state: resolved }), className),
    ...props,
  }

  if (asChild && isValidElement(children)) {
    return <Slot.Root {...rootProps}>{cloneElement(children, undefined, content)}</Slot.Root>
  }
  return (
    <button type={type ?? 'button'} disabled={isDisabled} {...rootProps}>
      {content}
    </button>
  )
}
