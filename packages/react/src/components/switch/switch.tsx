import { cva } from 'class-variance-authority'
import { Switch as SwitchPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

const switchVariants = cva([
  'peer inline-flex h-5 w-11 shrink-0 items-center rounded-full border p-0.5 outline-none',
  // State colors apply only while enabled, so disabled (stroke only) wins in both positions.
  'not-data-disabled:data-[state=unchecked]:border-neutral not-data-disabled:data-[state=unchecked]:bg-neutral',
  'not-data-disabled:data-[state=unchecked]:hover:border-neutral-emphasized not-data-disabled:data-[state=unchecked]:hover:bg-neutral-hover',
  'not-data-disabled:data-[state=checked]:border-neutral-subtle not-data-disabled:data-[state=checked]:bg-neutral-emphasized',
  'not-data-disabled:data-[state=checked]:hover:bg-neutral-emphasized-hover',
  'focus-visible:border-transparent focus-visible:shadow-focus-ring',
  'data-disabled:pointer-events-none data-disabled:border-disabled data-disabled:bg-transparent',
])

const switchThumbVariants = cva([
  'pointer-events-none block h-4 w-6.5 rounded-full border bg-card-neutral-emphasized transition-transform',
  'data-[state=unchecked]:border-neutral-subtle data-[state=checked]:translate-x-3 data-[state=checked]:border-transparent',
  'data-disabled:border-transparent data-disabled:bg-current data-disabled:text-disabled',
])

/**
 * Switch: a 44×20 track with a 26×16 thumb. Off sits on the neutral background with a neutral stroke;
 * on fills the track with the emphasized neutral. Name it with a `<label htmlFor>` or `aria-label`.
 */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root data-slot="switch" className={cn(switchVariants(), className)} {...props}>
      <SwitchPrimitive.Thumb data-slot="switch-thumb" className={switchThumbVariants()} />
    </SwitchPrimitive.Root>
  )
}
