import { cva } from 'class-variance-authority'
import { createContext, useContext, useId, type AriaAttributes, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

const fieldLabelVariants = cva('text-label text-neutral', {
  variants: { disabled: { true: 'text-disabled', false: '' } },
  defaultVariants: { disabled: false },
})

// `disabled` comes after `invalid`, so a disabled caption stays gray even when the field is invalid.
const fieldCaptionVariants = cva('min-w-0 flex-1 text-neutral-subtle', {
  variants: {
    invalid: { true: 'text-danger', false: '' },
    disabled: { true: 'text-disabled', false: '' },
  },
  defaultVariants: { invalid: false, disabled: false },
})

const fieldCounterVariants = cva('ml-auto text-neutral-subtle tabular-nums', {
  variants: { disabled: { true: 'text-disabled', false: '' } },
  defaultVariants: { disabled: false },
})

interface FieldState {
  controlId: string
  labelId: string
  captionId: string
  hasCaption: boolean
  invalid: boolean
  disabled: boolean
}

const FieldContext = createContext<FieldState | null>(null)

interface ControlProps {
  id?: string
  disabled?: boolean
  'aria-invalid'?: AriaAttributes['aria-invalid']
  'aria-describedby'?: string
}

/**
 * Props a form control takes from the Field around it: id, description, invalid and disabled.
 * Explicit props on the control win. `attributes` go on the control element; `invalid` and
 * `disabled` drive its styles. `labelId` is the id of the Field's label, for a control that a
 * `<label htmlFor>` cannot name (a radio group) and takes it through `aria-labelledby`.
 */
export function useFieldControl(props: ControlProps) {
  const field = useContext(FieldContext)
  const ariaInvalid = props['aria-invalid'] ?? (field?.invalid ? true : undefined)
  const invalid = ariaInvalid !== undefined && ariaInvalid !== false && ariaInvalid !== 'false'
  const disabled = props.disabled ?? field?.disabled ?? false
  const describedBy =
    [props['aria-describedby'], field?.hasCaption ? field.captionId : undefined].filter(Boolean).join(' ') || undefined
  return {
    invalid,
    disabled,
    labelId: field?.labelId,
    attributes: {
      id: props.id ?? field?.controlId,
      disabled: disabled || undefined,
      'aria-invalid': ariaInvalid,
      'aria-describedby': describedBy,
    },
  }
}

export type FieldProps = Omit<ComponentProps<'div'>, 'children'> & {
  label: ReactNode
  /** Help text below the control; replaced by `error` when the field is invalid. */
  caption?: ReactNode
  /** Shown as the caption, in the danger color, and marks the control invalid. */
  error?: ReactNode
  /** Character or item count at the end of the caption row, e.g. `12/40`. */
  counter?: ReactNode
  disabled?: boolean
  children: ReactNode
}

/** Field: a label, one control (Input, Textarea, Select, RadioGroup) and a caption row, wired for assistive tech. */
export function Field({ label, caption, error, counter, disabled = false, className, children, ...props }: FieldProps) {
  const id = useId()
  const invalid = error !== undefined && error !== null && error !== false
  const message = invalid ? error : caption
  const state: FieldState = {
    controlId: `${id}-control`,
    labelId: `${id}-label`,
    captionId: `${id}-caption`,
    hasCaption: Boolean(message),
    invalid,
    disabled,
  }
  return (
    <FieldContext value={state}>
      <div
        data-slot="field"
        data-invalid={invalid || undefined}
        data-disabled={disabled || undefined}
        className={cn('flex min-w-0 flex-col gap-1.5', className)}
        {...props}
      >
        <label id={state.labelId} htmlFor={state.controlId} className={cn(fieldLabelVariants({ disabled }))}>
          {label}
        </label>
        {children}
        {(message || counter) && (
          <div className="flex gap-2 text-caption">
            {message && (
              <p id={state.captionId} className={cn(fieldCaptionVariants({ invalid, disabled }))}>
                {message}
              </p>
            )}
            {counter && <span className={cn(fieldCounterVariants({ disabled }))}>{counter}</span>}
          </div>
        )}
      </div>
    </FieldContext>
  )
}
