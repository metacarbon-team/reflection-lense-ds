import { cva } from 'class-variance-authority'
import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentProps,
  type KeyboardEvent,
  type ReactNode,
} from 'react'
import { cn } from '../../lib/cn'
import { composeRefs } from '../../lib/compose-refs'
import { focusGroupControl, inputGroupStateClass } from '../../lib/control-frame'
import { controlTransitionClass } from '../../lib/motion'
import { disabledAttrs } from '../../lib/disabled'
import { hasContent } from '../../lib/has-content'
import { ArrowUpIcon } from '../../lib/icons'
import { useFormReset } from '../../lib/use-form-reset'
import { useFieldControl } from '../field/field'
import { IconButton } from '../icon-button/icon-button'

const composedInputVariants = cva(
  [
    'flex w-full min-w-0 rounded-xl border border-neutral-subtle bg-card-neutral-emphasized text-body-small text-neutral shadow-sm',
    controlTransitionClass,
    'group/input-group hover:border-neutral data-filled:border-neutral',
    // Focus, invalid and disabled come from the text area only, not from a control in a slot.
    'has-[[data-slot=input-group-control]:focus-visible]:border-neutral-emphasized',
    inputGroupStateClass,
  ],
  {
    variants: {
      layout: {
        default: 'flex-col gap-3 p-3',
        compact: 'items-center gap-2 p-2',
      },
    },
    defaultVariants: { layout: 'default' },
  },
)

const textareaVariants = cva(
  'block max-h-30 min-w-0 resize-none overflow-y-auto bg-transparent field-sizing-content outline-none placeholder:text-neutral-subtle disabled:placeholder:text-disabled',
  {
    variants: {
      layout: {
        default: 'min-h-16 w-full',
        compact: 'min-h-8 flex-1 py-1.5',
      },
    },
    defaultVariants: { layout: 'default' },
  },
)

const slotClass = 'flex shrink-0 items-center gap-1.5'

export type ComposedInputProps = Omit<ComponentProps<'textarea'>, 'onSubmit'> & {
  /** `default` stacks the text area above a toolbar. `compact` is one row that grows with the text, for short prompts. */
  layout?: 'default' | 'compact'
  /** Controls at the start of the toolbar (`default`) or before the text (`compact`): attach, mode. Empty by default. */
  leadingToolbarSlot?: ReactNode
  /** Controls before the send button: a model or mode picker. Empty by default. */
  trailingToolbarSlot?: ReactNode
  /** Accessible name of the send button, which shows only an icon. */
  sendLabel?: string
  /**
   * Runs with the trimmed text when it is sent: the send button, or Enter in the text area (Shift+Enter
   * adds a new line). Nothing is sent while the text is empty. The composer is not a form, so it can sit
   * inside one; clearing the text after sending is up to you.
   */
  onSubmit?: (text: string) => void
}

const hasText = (value: unknown) => value !== undefined && value !== null && String(value) !== ''

/**
 * Composed Input: a chat composer, a text area with an optional toolbar and a send
 * button. Props go to the `<textarea>`; `className` goes to the frame. Give the text area a name with
 * `aria-label` or a Field label. Hover, focus, filled, invalid and disabled are read from the DOM; a
 * disabled composer also disables the controls in its slots. A click on the frame puts the focus in the text area.
 */
export function ComposedInput({
  layout = 'default',
  leadingToolbarSlot,
  trailingToolbarSlot,
  sendLabel = 'Send',
  className,
  onSubmit,
  onChange,
  onKeyDown,
  ref,
  ...props
}: ComposedInputProps) {
  const control = useFieldControl(props)
  const own = useRef<HTMLTextAreaElement>(null)
  const textareaRef = useMemo(() => composeRefs(own, ref), [ref])
  // A controlled field is read from `value`; an uncontrolled one remembers what the user typed.
  const [typed, setTyped] = useState(() => hasText(props.defaultValue))
  const filled = props.value !== undefined ? hasText(props.value) : typed
  // `form.reset()` restores the default text without a change event: read what the composer holds now.
  const onReset = useCallback(() => setTyped(hasText(own.current?.value)), [])
  useFormReset(own, onReset)

  const send = () => {
    const text = own.current?.value.trim() ?? ''
    if (text) onSubmit?.(text)
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setTyped(event.target.value !== '')
    onChange?.(event)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    send()
  }

  const leading = hasContent(leadingToolbarSlot) && (
    <div data-slot="composed-input-leading-slot" className={slotClass}>
      {leadingToolbarSlot}
    </div>
  )
  const trailing = hasContent(trailingToolbarSlot) && (
    <div data-slot="composed-input-trailing-slot" className={slotClass}>
      {trailingToolbarSlot}
    </div>
  )
  const sendButton = (
    <IconButton
      type="button"
      data-slot="composed-input-send"
      size="sm"
      aria-label={sendLabel}
      onClick={send}
      className="[&_svg:not([class*=size-])]:size-5"
    >
      <ArrowUpIcon />
    </IconButton>
  )
  const textarea = (
    <textarea
      rows={layout === 'compact' ? 1 : undefined}
      {...props}
      {...control.attributes}
      {...disabledAttrs(control.disabled, true)}
      data-slot="input-group-control"
      ref={textareaRef}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      className={textareaVariants({ layout })}
    />
  )

  return (
    <div
      data-slot="composed-input"
      data-filled={filled || undefined}
      onClick={focusGroupControl}
      className={cn(composedInputVariants({ layout }), className)}
    >
      {/* A disabled fieldset disables the controls in the slots too, so the whole composer goes quiet. */}
      <fieldset disabled={control.disabled} className="contents">
        {layout === 'compact' ? (
          <>
            {leading}
            {textarea}
            {trailing}
            {sendButton}
          </>
        ) : (
          <>
            {textarea}
            <div data-slot="composed-input-toolbar" className="flex w-full items-center gap-2">
              {leading}
              <div data-slot="composed-input-actions" className="ml-auto flex items-center gap-2">
                {trailing}
                {sendButton}
              </div>
            </div>
          </>
        )}
      </fieldset>
    </div>
  )
}
