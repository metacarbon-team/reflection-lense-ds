import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { disabledAttrs } from '../../lib/disabled'

/**
 * IconButton: the Button axes on a circle of 32/40/48px with a 16/24/32px icon. Unlike Button, the
 * neutral solid sits on the form surface, and disabled solid and outline keep a disabled fill.
 */
export const iconButtonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-full border border-transparent outline-none select-none',
    'focus-visible:border-transparent focus-visible:shadow-focus-ring',
    'data-disabled:pointer-events-none data-disabled:text-disabled data-disabled:shadow-none',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
  ],
  {
    variants: {
      tone: { default: '', accent: '', danger: '' },
      variant: {
        solid: 'shadow-sm data-disabled:border-disabled data-disabled:bg-disabled',
        outline: 'bg-transparent data-disabled:border-disabled data-disabled:bg-disabled',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'size-8 [&_svg]:size-4',
        md: 'size-10 [&_svg]:size-6',
        lg: 'size-12 [&_svg]:size-8',
      },
    },
    compoundVariants: [
      {
        variant: 'solid',
        tone: 'default',
        className:
          'border-neutral bg-form-neutral text-neutral hover:bg-form-neutral-hover active:bg-form-neutral-pressed',
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
    ],
    defaultVariants: { tone: 'default', variant: 'ghost', size: 'md' },
  },
)

export type IconButtonProps = Omit<ComponentProps<'button'>, 'aria-label'> &
  VariantProps<typeof iconButtonVariants> & {
    /** Accessible name; the button shows an icon only. */
    'aria-label': string
    asChild?: boolean
  }

export function IconButton({
  className,
  tone,
  variant,
  size,
  asChild = false,
  type,
  disabled,
  ...props
}: IconButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="icon-button"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(iconButtonVariants({ tone, variant, size }), className)}
      {...props}
      {...disabledAttrs(disabled, !asChild)}
    />
  )
}
