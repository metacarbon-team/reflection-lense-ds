import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { controlFrameClass } from '../../lib/control-frame'
import { useFieldControl } from '../field/field'

/** Textarea: several lines in the control frame, resizable vertically. */
export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  const control = useFieldControl(props)
  return (
    <textarea
      data-slot="textarea"
      data-invalid={control.invalid || undefined}
      data-disabled={control.disabled || undefined}
      {...props}
      {...control.attributes}
      className={cn(
        controlFrameClass,
        'block min-h-16 w-full min-w-0 resize-y px-3 py-2.5 outline-none focus-visible:shadow-focus-ring placeholder:text-neutral-subtle disabled:placeholder:text-disabled data-disabled:placeholder:text-disabled',
        className,
      )}
    />
  )
}
