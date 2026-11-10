import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { controlFrameClass } from '../../lib/control-frame'
import { disabledAttrs } from '../../lib/disabled'
import { useFieldControl } from '../field/field'

export type InputProps = Omit<ComponentProps<'input'>, 'size'> & {
  /** Content before the value: an icon, a country picker, a prefix. */
  leadingSlot?: ReactNode
  /** Content after the value: an icon, a unit, a clear button. */
  trailingSlot?: ReactNode
  /** Classes for the `<input>` itself; `className` styles the frame. */
  inputClassName?: string
}

// The addons dim with the input: the frame is a `group`, and the input inside it is disabled.
const addonClass = 'flex shrink-0 items-center text-neutral-subtle group-has-disabled:text-disabled'

/**
 * Input: one line of text in the control frame, with optional leading and trailing slots. Props go
 * to the `<input>`; `className` goes to the frame.
 */
export function Input({ leadingSlot, trailingSlot, className, inputClassName, ...props }: InputProps) {
  const control = useFieldControl(props)
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
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-subtle disabled:placeholder:text-disabled',
          // `type="search"` draws its own clear button in Chrome and Safari; clearing is the trailing slot's job.
          '[&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none',
          inputClassName,
        )}
      />
      {hasContent(trailingSlot) && (
        <span data-slot="input-addon" className={addonClass}>
          {trailingSlot}
        </span>
      )}
    </span>
  )
}
