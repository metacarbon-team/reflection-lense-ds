import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { controlFrameClass } from '../../lib/control-frame'
import { useFieldControl } from '../field/field'

export type InputProps = Omit<ComponentProps<'input'>, 'size'> & {
  /** Content before the value: an icon, a country picker, a prefix. */
  leading?: ReactNode
  /** Content after the value: an icon, a unit, a clear button. */
  trailing?: ReactNode
  /** Classes for the `<input>` itself; `className` styles the frame. */
  inputClassName?: string
}

/**
 * Input: one line of text in the control frame, with optional leading and trailing content. Props go
 * to the `<input>`; `className` goes to the frame.
 */
export function Input({ leading, trailing, className, inputClassName, ...props }: InputProps) {
  const control = useFieldControl(props)
  return (
    <span
      data-slot="input"
      data-invalid={control.invalid || undefined}
      data-disabled={control.disabled || undefined}
      className={cn(
        controlFrameClass,
        'group flex h-8 w-full min-w-0 items-center gap-1.5 px-3 focus-within:shadow-focus-ring [&_svg]:size-4 [&_svg]:shrink-0',
        className,
      )}
    >
      {leading && (
        <span
          data-slot="input-addon"
          className="flex shrink-0 items-center text-neutral-subtle group-data-disabled:text-disabled"
        >
          {leading}
        </span>
      )}
      <input
        {...props}
        {...control.attributes}
        className={cn(
          'h-full min-w-0 flex-1 bg-transparent outline-none placeholder:text-neutral-subtle disabled:placeholder:text-disabled group-data-disabled:placeholder:text-disabled',
          inputClassName,
        )}
      />
      {trailing && (
        <span
          data-slot="input-addon"
          className="flex shrink-0 items-center text-neutral-subtle group-data-disabled:text-disabled"
        >
          {trailing}
        </span>
      )}
    </span>
  )
}
