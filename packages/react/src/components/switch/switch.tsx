import { Switch as SwitchPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { useFieldControl } from '../field/field'

const switchClass = [
  'group peer inline-flex h-5 w-11 shrink-0 items-center rounded-full border p-0.5 outline-none',
  // State colors apply only while enabled, so disabled (stroke only) wins in both positions.
  'enabled:data-[state=unchecked]:border-neutral-subtle enabled:data-[state=unchecked]:bg-neutral',
  'enabled:data-[state=unchecked]:hover:border-neutral-emphasized enabled:data-[state=unchecked]:hover:bg-neutral-hover',
  'enabled:data-[state=checked]:border-neutral-subtle enabled:data-[state=checked]:bg-neutral-emphasized',
  'enabled:data-[state=checked]:hover:bg-neutral-emphasized-hover',
  'focus-visible:border-transparent focus-visible:shadow-focus-ring',
  'disabled:pointer-events-none disabled:border-disabled disabled:bg-transparent',
]

/**
 * Switch: a 44×20 track with a 26×16 thumb. Off sits on the neutral background with a neutral stroke;
 * on fills the track with the emphasized neutral. Name it with a `<label htmlFor>` or `aria-label`; in
 * a Field it takes the id, description, error and disabled state, like every other control.
 */
export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  const control = useFieldControl(props)
  return (
    <SwitchPrimitive.Root data-slot="switch" className={cn(switchClass, className)} {...props} {...control.attributes}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block h-4 w-6.5 rounded-full border bg-card-neutral-emphasized transition-transform data-[state=unchecked]:border-neutral-subtle data-[state=checked]:translate-x-3 data-[state=checked]:border-transparent group-disabled:border-transparent group-disabled:bg-current group-disabled:text-disabled"
      />
    </SwitchPrimitive.Root>
  )
}
