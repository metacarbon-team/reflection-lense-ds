import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cloneElement, isValidElement } from 'react'
import type { ComponentProps, ReactElement, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { disabledAttrs } from '../../lib/disabled'

/**
 * Link: type × size. An `inline` link is underlined and sits inside running text; a `standalone` link
 * has no underline and stands on its own line. Hover and focus-visible come from the browser in
 * `default`; the `hover`, `pressed` and `focus` states freeze them for docs and tests.
 */
export const linkVariants = cva(
  [
    'inline-flex items-center gap-1 rounded-sm outline-none',
    'data-disabled:pointer-events-none data-disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      type: { inline: '', standalone: '' },
      size: { sm: '', md: '' },
      state: {
        default: 'text-accent hover:text-neutral active:text-neutral-subtle focus-visible:shadow-focus-ring',
        hover: 'text-neutral',
        pressed: 'text-neutral-subtle',
        focus: 'text-accent shadow-focus-ring',
      },
    },
    compoundVariants: [
      { type: 'inline', size: 'sm', className: 'text-link-small' },
      { type: 'inline', size: 'md', className: 'text-link' },
      { type: 'standalone', size: 'sm', className: 'text-body-small-medium' },
      { type: 'standalone', size: 'md', className: 'text-body-medium' },
    ],
    defaultVariants: { type: 'inline', size: 'md', state: 'default' },
  },
)

const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

export type LinkProps = ComponentProps<'a'> &
  Omit<VariantProps<typeof linkVariants>, 'state' | 'type' | 'size'> & {
    /** `inline` is underlined and sits inside running text; `standalone` has no underline and stands on its own. */
    type?: 'inline' | 'standalone'
    /** `sm` is 14px text, `md` is 16px. */
    size?: 'sm' | 'md'
    /** Freezes `hover`, `pressed` or `focus` for docs and tests. Real interaction needs no value. */
    state?: 'default' | 'hover' | 'pressed' | 'focus'
    /** Blocks the link and dims it. A disabled link has no `href` and is skipped by the keyboard. */
    disabled?: boolean
    /** Content before the label, 16 × 16: usually an icon. The link shows the slot when it is set. */
    leadingSlot?: ReactNode
    /** Content after the label, 16 × 16. The link shows the slot when it is set. */
    trailingSlot?: ReactNode
    /** Render the only child (a router link) with the link's styles. Its own text becomes the label. */
    asChild?: boolean
  }

/**
 * Link: text that goes somewhere. It renders an `a`; with `asChild` it takes the place of a router
 * link and keeps the same look. Pass `leadingSlot` or `trailingSlot` to add an icon on either side.
 */
export function Link({
  className,
  type,
  size,
  state = 'default',
  disabled = false,
  leadingSlot,
  trailingSlot,
  asChild = false,
  href,
  children,
  ...props
}: LinkProps) {
  // A disabled link drops the frozen states; its look comes from `data-disabled`.
  const resolved = disabled ? 'default' : state

  const rootProps = {
    'data-slot': 'link',
    className: cn(linkVariants({ type, size, state: resolved }), className),
    ...props,
    ...disabledAttrs(disabled, false),
    ...(disabled ? { tabIndex: -1 } : {}),
  }

  const withSlots = (label: ReactNode) => (
    <>
      {hasContent(leadingSlot) && (
        <span data-slot="link-leading-slot" className="flex shrink-0 items-center justify-center">
          {leadingSlot}
        </span>
      )}
      {label}
      {hasContent(trailingSlot) && (
        <span data-slot="link-trailing-slot" className="flex shrink-0 items-center justify-center">
          {trailingSlot}
        </span>
      )}
    </>
  )

  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<{ children?: ReactNode }>
    return <Slot.Root {...rootProps}>{cloneElement(child, undefined, withSlots(child.props.children))}</Slot.Root>
  }
  return (
    <a href={disabled ? undefined : href} {...rootProps}>
      {withSlots(children)}
    </a>
  )
}
