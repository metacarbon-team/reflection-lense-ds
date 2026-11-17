import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { isValidElement } from 'react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { controlTransitionClass } from '../../lib/motion'
import { hasContent } from '../../lib/has-content'
import { linkChild } from '../../lib/disabled'
import { ChevronRightIcon, DotsIcon } from '../../lib/icons'
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../dropdown-menu/dropdown-menu'

export type BreadcrumbProps = ComponentProps<'nav'> & {
  /** The `breadcrumbItems` slot: `BreadcrumbItem`, `BreadcrumbSeparator` and `BreadcrumbEllipsis`, in path order. */
  children?: ReactNode
}

/**
 * Breadcrumb: the path to the current page as a row of links. A `nav` landmark with an ordered list;
 * put an item, a separator, an item, a separator and so on inside. Name the landmark with `aria-label`
 * when a page has more than one.
 */
export function Breadcrumb({ 'aria-label': ariaLabel = 'Breadcrumb', className, children, ...props }: BreadcrumbProps) {
  return (
    <nav data-slot="breadcrumb" aria-label={ariaLabel} className={cn('min-w-0', className)} {...props}>
      <ol data-slot="breadcrumb-items" className="flex items-center gap-1.5">
        {children}
      </ol>
    </nav>
  )
}

/**
 * Breadcrumb Item: `default` and `hover` are links; `active` is the current page, plain text that is not a link.
 * Hover and focus-visible come from the browser in `default`; `hover` freezes the hover look for docs and tests.
 */
const breadcrumbItemVariants = cva(
  [
    'inline-flex items-center rounded-lg px-1 py-0.5 text-body-xsmall whitespace-nowrap outline-none',
    controlTransitionClass,
  ],
  {
    variants: {
      state: {
        default: 'text-neutral-subtle hover:bg-ghost-neutral-hover hover:text-neutral focus-visible:shadow-focus-ring',
        hover: 'bg-ghost-neutral-hover text-neutral focus-visible:shadow-focus-ring',
        active: 'text-neutral',
      },
    },
    defaultVariants: { state: 'default' },
  },
)

export type BreadcrumbItemProps = Omit<ComponentProps<'a'>, 'children'> & {
  /** Text of the item. Keep it to one or two words. */
  label: ReactNode
  /**
   * `default` is a link. `hover` freezes the hover look for docs and tests. `active` marks the current
   * page: plain text with `aria-current="page"`, not a link. Use it on the last item only.
   */
  state?: VariantProps<typeof breadcrumbItemVariants>['state']
  /** Render the only child (a router link) with the item's styles. Its own text becomes the label. Ignored for `active`. */
  asChild?: boolean
  /** The link to render when `asChild` is set. */
  children?: ReactElement
}

/** One entry of the path: a link, or the current page when `state="active"`. Other props go to the link. */
export function BreadcrumbItem({
  label,
  state = 'default',
  asChild = false,
  className,
  children,
  ...props
}: BreadcrumbItemProps) {
  const classes = cn(breadcrumbItemVariants({ state }), className)

  if (state === 'active') {
    return (
      <li data-slot="breadcrumb-item" className="flex">
        <span data-slot="breadcrumb-link" aria-current="page" className={classes}>
          {label}
        </span>
      </li>
    )
  }

  return (
    <li data-slot="breadcrumb-item" className="flex">
      {asChild && isValidElement<{ children?: ReactNode }>(children) ? (
        <Slot.Root data-slot="breadcrumb-link" className={classes} {...props}>
          {linkChild(children, false, label)}
        </Slot.Root>
      ) : (
        <a data-slot="breadcrumb-link" className={classes} {...props}>
          {label}
        </a>
      )}
    </li>
  )
}

/** The mark between two items, 12 px. A chevron by default; `children` replace it with another glyph. Hidden from assistive tech. */
export function BreadcrumbSeparator({ className, children, ...props }: ComponentProps<'li'>) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn('flex shrink-0 items-center text-neutral-subtle [&_svg:not([class*=size-])]:size-3', className)}
      {...props}
    >
      {hasContent(children) ? children : <ChevronRightIcon />}
    </li>
  )
}

export type BreadcrumbEllipsisProps = Omit<ComponentProps<'li'>, 'children'> & {
  /** Accessible name of the "…" button. */
  label?: string
  /**
   * The levels left out of the path, top level first, as Dropdown Menu items:
   * `<DropdownMenuItem asChild><a href="/docs">Docs</a></DropdownMenuItem>`.
   */
  children: ReactNode
}

/**
 * Breadcrumb Ellipsis: the "…" that stands for the levels left out of a long path. It is a button with the
 * item's look that opens a Dropdown Menu of those levels, so every level stays one click away. Keep the
 * first item, the "…" and the last two levels.
 */
export function BreadcrumbEllipsis({
  label = 'Show hidden levels',
  className,
  children,
  ...props
}: BreadcrumbEllipsisProps) {
  return (
    <li data-slot="breadcrumb-ellipsis" className={cn('flex', className)} {...props}>
      <DropdownMenu>
        <DropdownMenuTrigger
          data-slot="breadcrumb-ellipsis-trigger"
          aria-label={label}
          className={cn(
            breadcrumbItemVariants({ state: 'default' }),
            // An open popup keeps its trigger pressed.
            'py-1 aria-expanded:bg-ghost-neutral-pressed aria-expanded:text-neutral [&_svg:not([class*=size-])]:size-4',
          )}
        >
          <DotsIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent>{children}</DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}
