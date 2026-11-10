import { cva } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { isValidElement } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { disabledAttrs, disabledLinkProps, linkChild } from '../../lib/disabled'

/**
 * IconButton: the Button axes (tone × variant × size × state) on a circle of 32/40/48px with a
 * 16/24/32px icon. Unlike Button, the neutral solid sits on the form surface, and disabled solid and
 * outline keep a disabled fill. Hover, press and focus-visible come from the browser in `default`; the
 * `hover`, `pressed` and `focus` states freeze them for docs and tests.
 */
export const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-full border border-transparent outline-none select-none',
    // A popup trigger (`aria-expanded`: menu, Select, popover, dialog) keeps the pressed fill while open.
    'focus-visible:border-transparent focus-visible:shadow-focus-ring',
    'disabled:pointer-events-none data-disabled:pointer-events-none disabled:text-disabled data-disabled:text-disabled disabled:shadow-none data-disabled:shadow-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      tone: { default: '', accent: '', danger: '' },
      variant: {
        solid:
          'shadow-sm disabled:border-disabled data-disabled:border-disabled disabled:bg-disabled data-disabled:bg-disabled',
        outline:
          'bg-transparent disabled:border-disabled data-disabled:border-disabled disabled:bg-disabled data-disabled:bg-disabled',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'size-8 [&_svg]:size-4',
        md: 'size-10 [&_svg]:size-6',
        lg: 'size-12 [&_svg]:size-8',
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
          'border-neutral bg-form-neutral text-neutral hover:bg-form-neutral-hover active:bg-form-neutral-pressed aria-expanded:bg-form-neutral-pressed',
      },
      {
        variant: 'solid',
        tone: 'accent',
        className:
          'border-accent bg-accent-emphasized text-accent-on-emphasized hover:bg-accent-emphasized-hover active:bg-accent-emphasized-pressed aria-expanded:bg-accent-emphasized-pressed',
      },
      {
        variant: 'solid',
        tone: 'danger',
        className:
          'border-danger bg-danger-emphasized text-danger-on-emphasized hover:bg-danger-emphasized-hover active:bg-danger-emphasized-pressed aria-expanded:bg-danger-emphasized-pressed',
      },
      { variant: 'outline', tone: 'default', className: 'border-neutral' },
      { variant: 'outline', tone: 'accent', className: 'border-accent' },
      { variant: 'outline', tone: 'danger', className: 'border-danger' },
      {
        variant: ['outline', 'ghost'],
        tone: 'default',
        className:
          'text-neutral hover:bg-ghost-neutral-hover active:bg-ghost-neutral-pressed aria-expanded:bg-ghost-neutral-pressed',
      },
      {
        variant: ['outline', 'ghost'],
        tone: 'accent',
        className:
          'text-accent hover:bg-ghost-accent-hover active:bg-ghost-accent-pressed aria-expanded:bg-ghost-accent-pressed',
      },
      {
        variant: ['outline', 'ghost'],
        tone: 'danger',
        className:
          'text-danger hover:bg-ghost-danger-hover active:bg-ghost-danger-pressed aria-expanded:bg-ghost-danger-pressed',
      },
      // Frozen hover and pressed: the same background the browser state would give.
      { state: 'hover', variant: 'solid', tone: 'default', className: 'bg-form-neutral-hover' },
      { state: 'hover', variant: 'solid', tone: 'accent', className: 'bg-accent-emphasized-hover' },
      { state: 'hover', variant: 'solid', tone: 'danger', className: 'bg-danger-emphasized-hover' },
      { state: 'hover', variant: ['outline', 'ghost'], tone: 'default', className: 'bg-ghost-neutral-hover' },
      { state: 'hover', variant: ['outline', 'ghost'], tone: 'accent', className: 'bg-ghost-accent-hover' },
      { state: 'hover', variant: ['outline', 'ghost'], tone: 'danger', className: 'bg-ghost-danger-hover' },
      { state: 'pressed', variant: 'solid', tone: 'default', className: 'bg-form-neutral-pressed' },
      { state: 'pressed', variant: 'solid', tone: 'accent', className: 'bg-accent-emphasized-pressed' },
      { state: 'pressed', variant: 'solid', tone: 'danger', className: 'bg-danger-emphasized-pressed' },
      { state: 'pressed', variant: ['outline', 'ghost'], tone: 'default', className: 'bg-ghost-neutral-pressed' },
      { state: 'pressed', variant: ['outline', 'ghost'], tone: 'accent', className: 'bg-ghost-accent-pressed' },
      { state: 'pressed', variant: ['outline', 'ghost'], tone: 'danger', className: 'bg-ghost-danger-pressed' },
    ],
    defaultVariants: { tone: 'accent', variant: 'solid', size: 'md', state: 'default' },
  },
)

export type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> & {
  /** Accessible name; the button shows an icon only. */
  'aria-label': string
  /** What the button communicates. `accent` marks the main action, `default` the secondary ones, `danger` a destructive one. */
  tone?: 'default' | 'accent' | 'danger'
  /** Visual weight, `type` in Figma. `solid` for the main action in a group, `outline` and `ghost` for lower emphasis. */
  variant?: 'solid' | 'outline' | 'ghost'
  /** Diameter and icon: `sm` 32 with a 16 px icon, `md` 40 with 24, `lg` 48 with 32. Keep one size within a group. */
  size?: 'sm' | 'md' | 'lg'
  /** Freezes `hover`, `pressed` or `focus` for docs and tests. In `default` the browser decides. */
  state?: 'default' | 'hover' | 'pressed' | 'focus'
  /** Blocks the action and dims the button. Independent of `state`. */
  disabled?: boolean
  /** Render the only child (a link, a router link) with the icon button's styles and behaviour. */
  asChild?: boolean
}

/** The only content of the button is its icon, passed as `children`; the icon size follows `size`. */
export function IconButton({
  className,
  tone,
  variant,
  size,
  state = 'default',
  asChild = false,
  type,
  disabled,
  children,
  ...props
}: IconButtonProps) {
  // A disabled button drops the frozen states; its look comes from `data-disabled`.
  const resolvedState = disabled ? 'default' : state
  const rootProps = {
    'data-slot': 'icon-button',
    className: cn(iconButtonVariants({ tone, variant, size, state: resolvedState }), className),
  }

  if (asChild && isValidElement<{ children?: ReactNode }>(children)) {
    return (
      <Slot.Root {...rootProps} {...props} {...disabledLinkProps(disabled)}>
        {linkChild(children, disabled)}
      </Slot.Root>
    )
  }
  return (
    <button type={type ?? 'button'} {...rootProps} {...props} {...disabledAttrs(disabled, true)}>
      {children}
    </button>
  )
}
