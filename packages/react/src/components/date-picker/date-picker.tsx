import { Popover as PopoverPrimitive } from 'radix-ui'
import { useRef, type KeyboardEvent, type ReactNode } from 'react'
import { CalendarIcon } from '../../lib/icons'
import { useControlled } from '../../lib/use-controlled'
import { Input } from '../input/input'
import { Popover, PopoverAnchor, PopoverTrigger } from '../popover/popover'
import { Calendar, type CalendarProps } from './calendar'

export type DatePickerProps = Pick<
  CalendarProps,
  'minDate' | 'maxDate' | 'disabledDates' | 'locale' | 'weekStartsOn' | 'labels'
> & {
  /** The chosen date. Pass `null` for a controlled empty picker. */
  value?: Date | null
  /** The date chosen at the start, for an uncontrolled picker. */
  defaultValue?: Date | null
  /** Called with the date the user picks. The calendar closes after it. */
  onValueChange?: (date: Date) => void
  /** Whether the calendar is open. */
  open?: boolean
  /** Called when the calendar opens or closes. */
  onOpenChange?: (open: boolean) => void
  /**
   * The element that opens the calendar. It is an Input with a calendar icon by default, showing the
   * chosen date or the placeholder; swap it for a Select, a Button or an IconButton with a calendar
   * icon. It gets `aria-expanded` and `aria-haspopup`, and the picker does not show the date in a
   * custom trigger: do it in your own element.
   */
  popoverTrigger?: ReactNode
  /** Text of the default trigger while no date is chosen. */
  placeholder?: string
  /** Accessible name of the calendar dialog. */
  calendarLabel?: string
  /** Blocks the default trigger and dims it. A Field around the picker disables it too. */
  disabled?: boolean
  /** Marks the default trigger as invalid. A Field with an `error` does it for you. */
  'aria-invalid'?: boolean | 'true' | 'false'
  /** Accessible name of the default trigger. Needed when no Field gives it a label. */
  'aria-label'?: string
}

/**
 * Date Picker: a trigger with the Calendar under it, in a popover. Put it in a Field to give the trigger a
 * label, a caption and an error. The popover closes when a date is picked or on Escape, and focus goes
 * back to the trigger.
 */
export function DatePicker({
  value,
  defaultValue,
  onValueChange,
  open,
  onOpenChange,
  popoverTrigger,
  placeholder = 'Pick a date',
  calendarLabel = 'Choose a date',
  disabled,
  'aria-invalid': ariaInvalid,
  'aria-label': ariaLabel,
  locale = 'en-US',
  ...calendarProps
}: DatePickerProps) {
  const content = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLSpanElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [date, setDate] = useControlled<Date | null>(value, defaultValue ?? null)
  const [isOpen, setOpen] = useControlled<boolean>(open, false, onOpenChange)

  const formatted = date ? new Intl.DateTimeFormat(locale, { dateStyle: 'medium' }).format(date) : ''
  // A read-only input does not click on Enter, so the keys that open a popup open it here.
  const openWithKeys = (event: KeyboardEvent) => {
    if (['Enter', ' ', 'ArrowDown'].includes(event.key)) {
      event.preventDefault()
      setOpen(true)
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setOpen}>
      {popoverTrigger ? (
        <PopoverTrigger asChild>{popoverTrigger}</PopoverTrigger>
      ) : (
        // The calendar lines up with the field frame, not with the text inside it. A click anywhere on the
        // frame (the icon, the padding) acts as a click on the input, which is the trigger. The keyboard
        // reaches the input itself, so the frame needs no key handler of its own.
        <PopoverAnchor asChild>
          <span
            ref={field}
            data-slot="date-picker-field"
            className="flex w-full min-w-0"
            onClick={(event) => {
              if (event.target !== input.current) input.current?.click()
            }}
          >
            <PopoverTrigger asChild>
              <Input
                ref={input}
                // Radix gives the trigger `type="button"`; an input must stay a text input.
                type="text"
                readOnly
                // A read-only text input that opens a popup is a combobox: this role allows `aria-expanded`.
                role="combobox"
                value={formatted}
                placeholder={placeholder}
                leadingSlot={<CalendarIcon />}
                disabled={disabled}
                aria-invalid={ariaInvalid}
                aria-label={ariaLabel}
                className="cursor-pointer"
                inputClassName="cursor-pointer"
                aria-haspopup="dialog"
                onKeyDown={openWithKeys}
              />
            </PopoverTrigger>
          </span>
        </PopoverAnchor>
      )}
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          ref={content}
          data-slot="date-picker-content"
          aria-label={calendarLabel}
          side="bottom"
          align="start"
          sideOffset={4}
          className="z-50 outline-none"
          // A press on the frame toggles the calendar through the input; it must not also dismiss it first.
          onInteractOutside={(event) => {
            if (field.current?.contains(event.target as Node)) event.preventDefault()
          }}
          // Focus the day in the tab order instead of the first button of the calendar.
          onOpenAutoFocus={(event) => {
            event.preventDefault()
            content.current?.querySelector<HTMLElement>('[data-date][tabindex="0"]')?.focus()
          }}
        >
          <Calendar
            {...calendarProps}
            locale={locale}
            value={date}
            onValueChange={(next) => {
              setDate(next)
              onValueChange?.(next)
              setOpen(false)
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </Popover>
  )
}
