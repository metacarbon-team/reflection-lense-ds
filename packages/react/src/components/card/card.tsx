import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/**
 * Card: a raised container. `default` is the emphasized card surface, `subtle` the plain one; status
 * tones use their card tint and stroke. Padding sets the inner space and the gap between children.
 */
export const cardVariants = cva('flex min-w-0 flex-col rounded-xl border text-neutral shadow-xs', {
  variants: {
    tone: {
      default: 'border-neutral-subtle bg-card-neutral-emphasized',
      subtle: 'border-neutral-subtle bg-card-neutral',
      success: 'border-success bg-card-success',
      warning: 'border-warning bg-card-warning',
      danger: 'border-danger bg-card-danger',
      info: 'border-info bg-card-info',
    },
    padding: {
      none: 'gap-3 p-0',
      sm: 'gap-2 p-2',
      md: 'gap-3 p-4',
      lg: 'gap-4 p-5',
    },
  },
  defaultVariants: { tone: 'default', padding: 'md' },
})

export type CardProps = ComponentProps<'div'> & VariantProps<typeof cardVariants> & { asChild?: boolean }

export function Card({ className, tone, padding, asChild = false, ...props }: CardProps) {
  const Comp = asChild ? Slot.Root : 'div'
  return <Comp data-slot="card" className={cn(cardVariants({ tone, padding }), className)} {...props} />
}
