import { cva } from 'class-variance-authority'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { CheckIcon, DashIcon } from '../../lib/icons'
import { useFieldControl } from '../field/field'

/**
 * `state` is resolved in `Checkbox` (disabled, then invalid, then the prop), so each variant lists its
 * whole look and the selection (`data-state`) picks the colors. Hover and focus-visible come from the
 * browser in `default`; the `hover` and `focus` variants freeze them for docs and tests.
 */
const checkboxVariants = cva(
  'group peer inline-flex size-5 shrink-0 items-center justify-center rounded-md border align-middle outline-none',
  {
    variants: {
      state: {
        default: [
          'data-[state=unchecked]:border-neutral data-[state=unchecked]:bg-form-neutral data-[state=unchecked]:shadow-sm',
          'data-[state=unchecked]:hover:border-neutral-emphasized data-[state=unchecked]:hover:bg-form-neutral-hover',
          'data-[state=checked]:border-transparent data-[state=checked]:bg-neutral-emphasized data-[state=checked]:text-neutral-on-emphasized data-[state=checked]:shadow-sm',
          'data-[state=checked]:hover:bg-neutral-emphasized-hover',
          'data-[state=indeterminate]:border-neutral-emphasized data-[state=indeterminate]:bg-neutral data-[state=indeterminate]:text-neutral data-[state=indeterminate]:shadow-sm',
          'data-[state=indeterminate]:hover:bg-neutral-hover',
          'data-[state=unchecked]:focus-visible:border-transparent data-[state=unchecked]:focus-visible:shadow-focus-ring',
          'data-[state=checked]:focus-visible:shadow-focus-ring data-[state=indeterminate]:focus-visible:border-transparent data-[state=indeterminate]:focus-visible:shadow-focus-ring',
        ],
        hover: [
          'data-[state=unchecked]:border-neutral-emphasized data-[state=unchecked]:bg-form-neutral-hover data-[state=unchecked]:shadow-sm',
          'data-[state=checked]:border-transparent data-[state=checked]:bg-neutral-emphasized-hover data-[state=checked]:text-neutral-on-emphasized data-[state=checked]:shadow-sm',
          'data-[state=indeterminate]:border-neutral-emphasized data-[state=indeterminate]:bg-neutral-hover data-[state=indeterminate]:text-neutral data-[state=indeterminate]:shadow-sm',
        ],
        focus: [
          'border-transparent shadow-focus-ring',
          'data-[state=unchecked]:bg-form-neutral',
          'data-[state=checked]:bg-neutral-emphasized data-[state=checked]:text-neutral-on-emphasized',
          'data-[state=indeterminate]:bg-neutral data-[state=indeterminate]:text-neutral',
        ],
        error: [
          'data-[state=unchecked]:border-danger-emphasized data-[state=unchecked]:bg-form-neutral data-[state=unchecked]:shadow-sm',
          'data-[state=checked]:border-transparent data-[state=checked]:bg-danger-emphasized data-[state=checked]:text-danger-on-emphasized data-[state=checked]:shadow-sm',
          'data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-danger-emphasized data-[state=indeterminate]:text-danger-on-emphasized data-[state=indeterminate]:shadow-sm',
          'focus-visible:shadow-focus-ring',
        ],
        disabled: [
          'pointer-events-none data-[state=unchecked]:border-disabled data-[state=unchecked]:bg-disabled',
          'data-[state=checked]:border-transparent data-[state=checked]:bg-disabled data-[state=checked]:text-disabled',
          'data-[state=indeterminate]:border-transparent data-[state=indeterminate]:bg-disabled data-[state=indeterminate]:text-disabled',
        ],
      },
    },
    defaultVariants: { state: 'default' },
  },
)

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** `false`, `true` or `'indeterminate'`, for a parent whose children are only partly selected. */
  checked?: boolean | 'indeterminate'
  /** Freezes `hover` or `focus` for docs and tests. Error comes from `aria-invalid`, disabled from `disabled`. */
  state?: 'default' | 'hover' | 'focus' | 'error'
}

/**
 * Checkbox: a 20×20 box with three values: unchecked, checked and indeterminate. Use indeterminate
 * only for a parent whose children are partly selected: all selected is checked, none is unchecked.
 * Error comes from `aria-invalid` or a Field error. Name it with a `<label htmlFor>` or `aria-label`.
 */
export function Checkbox({ state = 'default', className, ...props }: CheckboxProps) {
  const control = useFieldControl(props)
  const disabled = control.disabled
  const resolved = disabled ? 'disabled' : control.invalid ? 'error' : state
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      {...props}
      {...control.attributes}
      disabled={disabled || undefined}
      className={cn(checkboxVariants({ state: resolved }), className)}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex size-4 items-center justify-center">
        <CheckIcon className="size-4 group-data-[state=indeterminate]:hidden" />
        <DashIcon className="hidden size-4 group-data-[state=indeterminate]:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}
