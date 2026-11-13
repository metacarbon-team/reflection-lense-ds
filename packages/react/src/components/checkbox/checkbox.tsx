import { cva } from 'class-variance-authority'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { CheckboxCheckMark, checkboxBoxClass, CheckboxIndeterminateMark } from '../../lib/checkbox'
import { cn } from '../../lib/cn'
import { useFieldControl } from '../field/field'

/**
 * Colors apply only while enabled, so the disabled look in the base always wins, as in Radio and
 * Switch. Each variant lists its whole look and the selection (`data-state`) picks the colors. Hover
 * and focus-visible come from the browser in `default`; the `hover` and `focus` variants freeze them
 * for docs and tests; `error` comes from `aria-invalid`, a Field error or `state="error"`.
 */
const checkboxVariants = cva(
  [
    checkboxBoxClass,
    'group peer align-middle outline-none',
    // Disabled from the DOM, so a `disabled` prop and a `<fieldset disabled>` look the same.
    'disabled:pointer-events-none disabled:data-[state=unchecked]:border-disabled disabled:data-[state=unchecked]:bg-disabled',
    'disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-disabled disabled:data-[state=checked]:text-disabled',
    'disabled:data-[state=indeterminate]:border-transparent disabled:data-[state=indeterminate]:bg-disabled disabled:data-[state=indeterminate]:text-disabled',
    // The error look keys on `aria-invalid` and outranks every other state, as in Radio.
    'enabled:aria-invalid:data-[state=unchecked]:border-danger-emphasized enabled:aria-invalid:data-[state=unchecked]:focus-visible:border-danger-emphasized',
    'enabled:aria-invalid:data-[state=checked]:bg-danger-emphasized enabled:aria-invalid:data-[state=checked]:text-danger-on-emphasized',
    'enabled:aria-invalid:data-[state=checked]:hover:bg-danger-emphasized-hover',
    'enabled:aria-invalid:data-[state=indeterminate]:border-transparent enabled:aria-invalid:data-[state=indeterminate]:bg-danger-emphasized enabled:aria-invalid:data-[state=indeterminate]:text-danger-on-emphasized',
    'enabled:aria-invalid:data-[state=indeterminate]:hover:bg-danger-emphasized-hover',
  ],
  {
    variants: {
      state: {
        default: [
          'enabled:data-[state=unchecked]:border-neutral-emphasized enabled:data-[state=unchecked]:bg-form-neutral enabled:data-[state=unchecked]:shadow-sm',
          'enabled:data-[state=unchecked]:hover:bg-form-neutral-hover',
          'enabled:data-[state=checked]:border-transparent enabled:data-[state=checked]:bg-neutral-emphasized enabled:data-[state=checked]:text-neutral-on-emphasized enabled:data-[state=checked]:shadow-sm',
          'enabled:data-[state=checked]:hover:bg-neutral-emphasized-hover',
          'enabled:data-[state=indeterminate]:border-neutral-emphasized enabled:data-[state=indeterminate]:bg-neutral enabled:data-[state=indeterminate]:text-neutral enabled:data-[state=indeterminate]:shadow-sm',
          'enabled:data-[state=indeterminate]:hover:bg-neutral-hover',
          'enabled:data-[state=unchecked]:focus-visible:border-transparent enabled:data-[state=unchecked]:focus-visible:shadow-focus-ring',
          'enabled:data-[state=checked]:focus-visible:shadow-focus-ring enabled:data-[state=indeterminate]:focus-visible:border-transparent enabled:data-[state=indeterminate]:focus-visible:shadow-focus-ring',
        ],
        hover: [
          'enabled:data-[state=unchecked]:border-neutral-emphasized enabled:data-[state=unchecked]:bg-form-neutral-hover enabled:data-[state=unchecked]:shadow-sm',
          'enabled:data-[state=checked]:border-transparent enabled:data-[state=checked]:bg-neutral-emphasized-hover enabled:data-[state=checked]:text-neutral-on-emphasized enabled:data-[state=checked]:shadow-sm',
          'enabled:data-[state=indeterminate]:border-neutral-emphasized enabled:data-[state=indeterminate]:bg-neutral-hover enabled:data-[state=indeterminate]:text-neutral enabled:data-[state=indeterminate]:shadow-sm',
        ],
        focus: [
          'enabled:border-transparent enabled:shadow-focus-ring',
          'enabled:data-[state=unchecked]:bg-form-neutral',
          'enabled:data-[state=checked]:bg-neutral-emphasized enabled:data-[state=checked]:text-neutral-on-emphasized',
          'enabled:data-[state=indeterminate]:bg-neutral enabled:data-[state=indeterminate]:text-neutral',
        ],
      },
    },
    defaultVariants: { state: 'default' },
  },
)

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** `false`, `true` or `'indeterminate'`, for a parent whose children are only partly selected. */
  checked?: boolean | 'indeterminate'
  /** Freezes `hover` or `focus` for docs and tests. `error` also sets `aria-invalid`; disabled comes from `disabled`. */
  state?: 'default' | 'hover' | 'focus' | 'error'
}

/**
 * Checkbox: a 20×20 box with three values: unchecked, checked and indeterminate. Use indeterminate
 * only for a parent whose children are partly selected: all selected is checked, none is unchecked.
 * Error comes from `aria-invalid`, a Field error or `state="error"`. Name it with a `<label htmlFor>` or `aria-label`.
 */
export function Checkbox({ state = 'default', className, ...props }: CheckboxProps) {
  const control = useFieldControl(props)
  const invalid = control.invalid || state === 'error'
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      {...props}
      {...control.attributes}
      aria-invalid={invalid || control.attributes['aria-invalid']}
      className={cn(checkboxVariants({ state: state === 'error' ? 'default' : state }), className)}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex size-4 items-center justify-center">
        <CheckboxCheckMark className="size-4 group-data-[state=indeterminate]:hidden" />
        <CheckboxIndeterminateMark className="hidden size-4 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
