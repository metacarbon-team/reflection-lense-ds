import { cva } from 'class-variance-authority'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { createContext, useContext, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { useFieldControl } from '../field/field'

/**
 * Colors apply only while enabled, so the disabled look in the base always wins. Hover and
 * focus-visible come from the browser in `default`; the `hover` and `focus` variants freeze them
 * for docs and tests. The selection (`data-state`) picks the colors inside each variant.
 */
const radioVariants = cva(
  [
    'group peer inline-flex size-5 shrink-0 items-center justify-center rounded-full border outline-none',
    'disabled:pointer-events-none disabled:data-[state=unchecked]:border-disabled disabled:data-[state=unchecked]:bg-disabled',
    'disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-disabled disabled:data-[state=checked]:text-disabled',
  ],
  {
    variants: {
      state: {
        default: [
          'enabled:data-[state=unchecked]:border-neutral enabled:data-[state=unchecked]:bg-form-neutral enabled:data-[state=unchecked]:shadow-xs',
          'enabled:data-[state=unchecked]:hover:border-neutral-emphasized enabled:data-[state=unchecked]:hover:bg-form-neutral-hover',
          'enabled:data-[state=checked]:border-transparent enabled:data-[state=checked]:bg-neutral-emphasized enabled:data-[state=checked]:text-neutral-on-emphasized enabled:data-[state=checked]:shadow-xs',
          'enabled:data-[state=checked]:hover:bg-neutral-emphasized-hover',
          'enabled:focus-visible:shadow-focus-ring enabled:data-[state=unchecked]:focus-visible:border-transparent',
        ],
        hover: [
          'enabled:data-[state=unchecked]:border-neutral-emphasized enabled:data-[state=unchecked]:bg-form-neutral-hover enabled:data-[state=unchecked]:shadow-xs',
          'enabled:data-[state=checked]:border-transparent enabled:data-[state=checked]:bg-neutral-emphasized-hover enabled:data-[state=checked]:text-neutral-on-emphasized enabled:data-[state=checked]:shadow-xs',
        ],
        focus: [
          'enabled:border-transparent enabled:shadow-focus-ring',
          'enabled:data-[state=unchecked]:bg-form-neutral',
          'enabled:data-[state=checked]:bg-neutral-emphasized enabled:data-[state=checked]:text-neutral-on-emphasized',
        ],
        error: [
          'enabled:data-[state=unchecked]:border-danger-emphasized enabled:data-[state=unchecked]:bg-form-neutral enabled:data-[state=unchecked]:shadow-sm',
          'enabled:data-[state=checked]:border-transparent enabled:data-[state=checked]:bg-danger-emphasized enabled:data-[state=checked]:text-danger-on-emphasized enabled:data-[state=checked]:shadow-sm',
          'enabled:focus-visible:shadow-focus-ring',
        ],
      },
    },
    defaultVariants: { state: 'default' },
  },
)

export type RadioGroupProps = ComponentProps<typeof RadioGroupPrimitive.Root>

/** Carries the group's error state down to its radios. */
const RadioGroupInvalidContext = createContext(false)

/**
 * RadioGroup: holds a set of radios and lets exactly one be selected. Arrow keys move the
 * selection. Name the group with `aria-label` or `aria-labelledby`; `disabled` here disables every
 * radio. In a Field the group takes the id, description, error and disabled state, and every radio shows the error.
 */
export function RadioGroup({ className, ...props }: RadioGroupProps) {
  const control = useFieldControl(props)
  return (
    <RadioGroupInvalidContext value={control.invalid}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn('flex flex-col gap-3', className)}
        {...props}
        {...control.attributes}
      />
    </RadioGroupInvalidContext>
  )
}

export type RadioProps = ComponentProps<typeof RadioGroupPrimitive.Item> & {
  /** Freezes `hover` or `focus` for docs and tests. Error comes from `aria-invalid`, disabled from `disabled`. */
  state?: 'default' | 'hover' | 'focus' | 'error' | 'disabled'
}

/**
 * Radio: a 20×20 circle that shows an 8 px dot when selected. Use it inside a `RadioGroup`; once
 * selected it changes only by choosing another option. Name it with a `<label htmlFor>` or `aria-label`.
 */
export function Radio({ state = 'default', disabled, className, ...props }: RadioProps) {
  const ariaInvalid = props['aria-invalid']
  const groupInvalid = useContext(RadioGroupInvalidContext)
  const invalid = groupInvalid || (ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== 'false')
  // `disabled` is styled by the base classes, so the variant only decides between error and the frozen states.
  const variant = state === 'disabled' ? 'default' : invalid ? 'error' : state
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio"
      disabled={disabled || state === 'disabled' || undefined}
      className={cn(radioVariants({ state: variant }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-indicator" className="block size-2 rounded-full bg-current" />
    </RadioGroupPrimitive.Item>
  )
}
