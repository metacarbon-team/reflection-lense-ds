import { createContext, useContext, useId, type AriaAttributes, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface FieldState {
  controlId: string
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
 * `disabled` drive its styles.
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

/** Field: a label, one control (Input, Textarea, Select) and a caption row, wired for assistive tech. */
export function Field({ label, caption, error, counter, disabled = false, className, children, ...props }: FieldProps) {
  const id = useId()
  const invalid = error !== undefined && error !== null && error !== false
  const message = invalid ? error : caption
  const state: FieldState = {
    controlId: `${id}-control`,
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
        <label htmlFor={state.controlId} className={cn('text-label text-neutral', disabled && 'text-disabled')}>
          {label}
        </label>
        {children}
        {(message || counter) && (
          <div className="flex gap-2 text-caption">
            {message && (
              <p
                id={state.captionId}
                className={cn(
                  'min-w-0 flex-1 text-neutral-subtle',
                  invalid && 'text-danger',
                  disabled && 'text-disabled',
                )}
              >
                {message}
              </p>
            )}
            {counter && (
              <span className={cn('ml-auto text-neutral-subtle tabular-nums', disabled && 'text-disabled')}>
                {counter}
              </span>
            )}
          </div>
        )}
      </div>
    </FieldContext>
  )
}
