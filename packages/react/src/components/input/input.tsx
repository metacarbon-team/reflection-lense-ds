import { useMemo, useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { composeRefs } from '../../lib/compose-refs'
import { controlFrameClass } from '../../lib/control-frame'
import { disabledAttrs } from '../../lib/disabled'
import { hasContent } from '../../lib/has-content'
import { CloseIcon } from '../../lib/icons'
import { useFieldControl } from '../field/field'

export type InputProps = Omit<ComponentProps<'input'>, 'size'> & {
  /** Content before the value: an icon, a country picker, a prefix. */
  leadingSlot?: ReactNode
  /** Content after the value: an icon, a unit. A search field without it gets the clear button here. */
  trailingSlot?: ReactNode
  /** Accessible name of the clear button of a search field. */
  clearLabel?: string
  /** Classes for the `<input>` itself; `className` styles the frame. */
  inputClassName?: string
}

// The addons dim with the input: the frame is a `group`, and the input inside it is disabled.
const addonClass = 'flex shrink-0 items-center text-neutral-subtle group-has-disabled:text-disabled'

const hasText = (value: unknown) => value !== undefined && value !== null && String(value) !== ''

/**
 * Input: one line of text in the control frame, with optional leading and trailing slots. Props go
 * to the `<input>`; `className` goes to the frame. `type="search"` shows a clear button while the field
 * holds text, as the filled search state in Figma; it works with `value` and with `defaultValue`.
 */
export function Input({
  leadingSlot,
  trailingSlot,
  clearLabel = 'Clear',
  className,
  inputClassName,
  ref,
  onChange,
  ...props
}: InputProps) {
  const control = useFieldControl(props)
  const own = useRef<HTMLInputElement>(null)
  const inputRef = useMemo(() => composeRefs(own, ref), [ref])
  // A controlled field is read from `value`; an uncontrolled one remembers what the user typed.
  const [typed, setTyped] = useState(() => hasText(props.defaultValue))
  const filled = props.value !== undefined ? hasText(props.value) : typed
  const clearable =
    props.type === 'search' && filled && !control.disabled && !props.readOnly && !hasContent(trailingSlot)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTyped(event.target.value !== '')
    onChange?.(event)
  }

  // Clears the way the browser does: the native value setter and an `input` event, so `onChange` runs
  // for a controlled and an uncontrolled field alike. Focus stays in the field.
  const clear = () => {
    const input = own.current
    if (!input) return
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(input, '')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    input.focus()
  }

  return (
    <span
      data-slot="input"
      data-invalid={control.invalid || undefined}
      className={cn(
        controlFrameClass,
        'group flex h-8 w-full min-w-0 items-center gap-1.5 px-3 focus-within:shadow-focus-ring [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
    >
      {hasContent(leadingSlot) && (
        <span data-slot="input-addon" className={addonClass}>
          {leadingSlot}
        </span>
      )}
      <input
        {...props}
        {...control.attributes}
        {...disabledAttrs(control.disabled, true)}
        ref={inputRef}
        onChange={handleChange}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-subtle disabled:placeholder:text-disabled',
          // `type="search"` draws its own clear button in Chrome and Safari; Input draws ours instead.
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
          inputClassName,
        )}
      />
      {clearable ? (
        <span data-slot="input-addon" className={addonClass}>
          <button
            type="button"
            data-slot="input-clear"
            aria-label={clearLabel}
            onClick={clear}
            className="flex rounded-xs outline-none hover:text-neutral focus-visible:shadow-focus-ring"
          >
            <CloseIcon />
          </button>
        </span>
      ) : (
        hasContent(trailingSlot) && (
          <span data-slot="input-addon" className={addonClass}>
            {trailingSlot}
          </span>
        )
      )}
    </span>
  )
}
