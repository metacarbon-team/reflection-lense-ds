import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cloneElement, isValidElement } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { disabledAttrs, inertProps } from '../../lib/disabled'

/**
 * Button: tone × variant × size. Solid fills with the tone's emphasized background; outline and ghost
 * are transparent and take `ghost/<tone>` on hover and press. Focus replaces the border and shadow
 * with the focus ring. Hover, press and focus-visible come from the browser in `default`; the `hover`,
 * `pressed` and `focus` states freeze them for docs and tests.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap',
    'rounded-md border border-transparent outline-none select-none',
    'focus-visible:border-transparent focus-visible:shadow-focus-ring',
    'disabled:pointer-events-none data-disabled:pointer-events-none disabled:text-disabled data-disabled:text-disabled disabled:shadow-none data-disabled:shadow-none',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      tone: { default: '', accent: '', danger: '' },
      variant: {
        solid:
          'shadow-sm disabled:border-disabled data-disabled:border-disabled disabled:bg-transparent data-disabled:bg-transparent',
        outline: 'bg-transparent disabled:border-disabled data-disabled:border-disabled',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'h-8 px-3 text-label',
        md: 'h-10 px-4 text-label',
        lg: 'h-12 px-5 text-label-large',
      },
      state: {
        default: '',
        hover: '',
        pressed: '',
        focus: 'border-transparent! shadow-focus-ring!',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        tone: 'default',
        className:
          'border-neutral bg-neutral-emphasized text-neutral-on-emphasized hover:bg-neutral-emphasized-hover active:bg-neutral-emphasized-pressed',
      },
      {
        variant: 'solid',
        tone: 'accent',
        className:
          'border-accent bg-accent-emphasized text-accent-on-emphasized hover:bg-accent-emphasized-hover active:bg-accent-emphasized-pressed',
      },
      {
        variant: 'solid',
        tone: 'danger',
        className:
          'border-danger bg-danger-emphasized text-danger-on-emphasized hover:bg-danger-emphasized-hover active:bg-danger-emphasized-pressed',
      },
      { variant: 'outline', tone: 'default', className: 'border-neutral' },
      { variant: 'outline', tone: 'accent', className: 'border-accent' },
      { variant: 'outline', tone: 'danger', className: 'border-danger' },
      {
        variant: ['outline', 'ghost'],
        tone: 'default',
        className: 'text-neutral hover:bg-ghost-neutral-hover active:bg-ghost-neutral-pressed',
      },
      {
        variant: ['outline', 'ghost'],
        tone: 'accent',
        className: 'text-accent hover:bg-ghost-accent-hover active:bg-ghost-accent-pressed',
      },
      {
        variant: ['outline', 'ghost'],
        tone: 'danger',
        className: 'text-danger hover:bg-ghost-danger-hover active:bg-ghost-danger-pressed',
      },
      // Frozen hover and pressed: the same background the browser state would give.
      { state: 'hover', variant: 'solid', tone: 'default', className: 'bg-neutral-emphasized-hover' },
      { state: 'hover', variant: 'solid', tone: 'accent', className: 'bg-accent-emphasized-hover' },
      { state: 'hover', variant: 'solid', tone: 'danger', className: 'bg-danger-emphasized-hover' },
      { state: 'hover', variant: ['outline', 'ghost'], tone: 'default', className: 'bg-ghost-neutral-hover' },
      { state: 'hover', variant: ['outline', 'ghost'], tone: 'accent', className: 'bg-ghost-accent-hover' },
      { state: 'hover', variant: ['outline', 'ghost'], tone: 'danger', className: 'bg-ghost-danger-hover' },
      { state: 'pressed', variant: 'solid', tone: 'default', className: 'bg-neutral-emphasized-pressed' },
      { state: 'pressed', variant: 'solid', tone: 'accent', className: 'bg-accent-emphasized-pressed' },
      { state: 'pressed', variant: 'solid', tone: 'danger', className: 'bg-danger-emphasized-pressed' },
      { state: 'pressed', variant: ['outline', 'ghost'], tone: 'default', className: 'bg-ghost-neutral-pressed' },
      { state: 'pressed', variant: ['outline', 'ghost'], tone: 'accent', className: 'bg-ghost-accent-pressed' },
      { state: 'pressed', variant: ['outline', 'ghost'], tone: 'danger', className: 'bg-ghost-danger-pressed' },
    ],
    defaultVariants: { tone: 'accent', variant: 'solid', size: 'md', state: 'default' },
  },
)

const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

export type ButtonProps = ComponentProps<'button'> & {
  /** What the button communicates. `accent` marks the main action, `default` the secondary ones, `danger` a destructive one. */
  tone?: 'default' | 'accent' | 'danger'
  /** Visual weight. `solid` for the main action in a group, `outline` and `ghost` for lower emphasis. */
  variant?: 'solid' | 'outline' | 'ghost'
  /** Height and padding: `sm` 32, `md` 40, `lg` 48 px. Keep one size within a group. */
  size?: 'sm' | 'md' | 'lg'
  /** Freezes `hover`, `pressed` or `focus` for docs and tests. In `default` the browser decides. */
  state?: 'default' | 'hover' | 'pressed' | 'focus'
  /** Blocks the action and dims the button. Independent of `state`. */
  disabled?: boolean
  /** Content before the label, 16 × 16: usually an icon. The button shows the slot when it is set. */
  leadingSlot?: ReactNode
  /** Content after the label, 16 × 16. The button shows the slot when it is set. */
  trailingSlot?: ReactNode
  /** Render the only child (a link, a router link) with the button's styles and behaviour. */
  asChild?: boolean
}

const slotClass = 'flex shrink-0 items-center justify-center'

export function Button({
  className,
  tone,
  variant,
  size,
  state = 'default',
  asChild = false,
  type,
  disabled,
  leadingSlot,
  trailingSlot,
  children,
  ...props
}: ButtonProps) {
  // A disabled button drops the frozen states; its look comes from `data-disabled`.
  const resolvedState = disabled ? 'default' : state
  const rootProps = {
    'data-slot': 'button',
    className: cn(buttonVariants({ tone, variant, size, state: resolvedState }), className),
  }
  const withSlots = (label: ReactNode) => (
    <>
      {hasContent(leadingSlot) && (
        <span data-slot="button-leading-slot" className={slotClass}>
          {leadingSlot}
        </span>
      )}
      {label}
      {hasContent(trailingSlot) && (
        <span data-slot="button-trailing-slot" className={slotClass}>
          {trailingSlot}
        </span>
      )}
    </>
  )

  if (asChild && isValidElement<{ children?: ReactNode }>(children)) {
    // A link cannot be disabled: it stays a link, marked `aria-disabled`, out of the Tab order, and a click is cancelled.
    return (
      <Slot.Root {...rootProps} {...props} {...disabledAttrs(disabled, false)} {...inertProps(disabled)}>
        {cloneElement(children, undefined, withSlots(children.props.children))}
      </Slot.Root>
    )
  }
  return (
    <button type={type ?? 'button'} {...rootProps} {...props} {...disabledAttrs(disabled, true)}>
      {withSlots(children)}
    </button>
  )
}
