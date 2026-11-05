import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/**
 * Button: tone × variant × size. Solid fills with the tone's emphasized background; outline and ghost
 * are transparent and take `ghost/<tone>` on hover and press. Focus replaces the border and shadow
 * with the focus ring.
 */
export const buttonVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap',
    'rounded-md border border-transparent outline-none select-none',
    'focus-visible:border-transparent focus-visible:shadow-focus-ring',
    'disabled:pointer-events-none disabled:text-disabled disabled:shadow-none',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      tone: { default: '', accent: '', danger: '' },
      variant: {
        solid: 'shadow-sm disabled:border-disabled disabled:bg-transparent',
        outline: 'bg-transparent disabled:border-disabled',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'h-8 px-3 text-label',
        md: 'h-10 px-4 text-label',
        lg: 'h-12 px-5 text-label-large',
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
    ],
    defaultVariants: { tone: 'default', variant: 'outline', size: 'md' },
  },
)

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render the only child (a link, a router link) with the button's styles and behaviour. */
    asChild?: boolean
  }

export function Button({ className, tone, variant, size, asChild = false, type, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      data-slot="button"
      type={asChild ? undefined : (type ?? 'button')}
      className={cn(buttonVariants({ tone, variant, size }), className)}
      {...props}
    />
  )
}
