import { cva } from 'class-variance-authority'
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui'
import { createContext, useContext, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { useFieldControl } from '../field/field'

/**
 * Colors apply only while enabled, so the disabled look in the base always wins. The error look keys
 * on `aria-invalid` in CSS and outranks every other state, as in Checkbox. Hover and focus-visible
 * come from the browser in `default`; the `hover` and `focus` variants freeze them for docs and tests.
 * The selection (`data-state`) picks the colors inside each variant.
 */
const radioVariants = cva(
  [
    'inline-flex size-5 shrink-0 items-center justify-center rounded-full border outline-none',
    'disabled:pointer-events-none disabled:data-[state=unchecked]:border-disabled disabled:data-[state=unchecked]:bg-disabled',
    'disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-disabled disabled:data-[state=checked]:text-disabled',
    'enabled:aria-invalid:data-[state=unchecked]:border-danger-emphasized enabled:aria-invalid:data-[state=unchecked]:focus-visible:border-danger-emphasized',
    'enabled:aria-invalid:data-[state=checked]:bg-danger-emphasized enabled:aria-invalid:data-[state=checked]:text-danger-on-emphasized',
    'enabled:aria-invalid:data-[state=checked]:hover:bg-danger-emphasized-hover',
  ],
  {
    variants: {
      state: {
        default: [
          'enabled:data-[state=unchecked]:border-neutral-emphasized enabled:data-[state=unchecked]:bg-form-neutral enabled:data-[state=unchecked]:shadow-xs',
          'enabled:data-[state=unchecked]:hover:bg-form-neutral-hover',
          'enabled:data-[state=checked]:border-transparent enabled:data-[state=checked]:bg-neutral-emphasized enabled:data-[state=checked]:text-neutral-on-emphasized enabled:data-[state=checked]:shadow-xs',
          'enabled:data-[state=checked]:hover:bg-neutral-emphasized-hover',
          // The ring is repeated per selection: `data-[state=…]:shadow-*` above is more specific than a bare `focus-visible:`.
          'enabled:data-[state=unchecked]:focus-visible:border-transparent enabled:data-[state=unchecked]:focus-visible:shadow-focus-ring',
          'enabled:data-[state=checked]:focus-visible:shadow-focus-ring',
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
 * radio. In a Field the group takes the id, description, error and disabled state, and every radio
 * shows the error. The Field's label names the group through `aria-labelledby`: a `<label htmlFor>`
 * cannot name a group.
 */
export function RadioGroup({ className, ...props }: RadioGroupProps) {
  const control = useFieldControl(props)
  const labelledBy = props['aria-labelledby'] ?? (props['aria-label'] ? undefined : control.labelId)
  return (
    <RadioGroupInvalidContext value={control.invalid}>
      <RadioGroupPrimitive.Root
        data-slot="radio-group"
        className={cn('flex flex-col gap-3', className)}
        {...props}
        {...control.attributes}
        aria-labelledby={labelledBy}
      />
    </RadioGroupInvalidContext>
  )
}

export type RadioProps = ComponentProps<typeof RadioGroupPrimitive.Item> & {
  /** The value the group takes when this radio is selected. */
  value: string
  /** Blocks selection and dims the radio. Independent of `state`. */
  disabled?: boolean
  /** Freezes `hover` or `focus` for docs and tests. `error` also sets `aria-invalid`; disabled comes from `disabled`. */
  state?: 'default' | 'hover' | 'focus' | 'error'
}

/**
 * Radio: a 20×20 circle that shows an 8 px dot when selected. Use it inside a `RadioGroup`; once
 * selected it changes only by choosing another option. Error comes from `aria-invalid`, a Field error
 * on the group or `state="error"`. Name it with a `<label htmlFor>` or `aria-label`.
 */
export function Radio({ state = 'default', className, ...props }: RadioProps) {
  // The group's error reaches every radio as `aria-invalid`; the radio's own prop wins.
  const groupInvalid = useContext(RadioGroupInvalidContext)
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio"
      aria-invalid={state === 'error' || groupInvalid || undefined}
      className={cn(radioVariants({ state: state === 'error' ? 'default' : state }), className)}
      {...props}
    >
      <RadioGroupPrimitive.Indicator data-slot="radio-indicator" className="block size-2 rounded-full bg-current" />
    </RadioGroupPrimitive.Item>
  )
}
