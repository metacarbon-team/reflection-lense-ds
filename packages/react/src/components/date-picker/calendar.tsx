import { useEffect, useId, useMemo, useRef, useState, type ComponentProps, type KeyboardEvent } from 'react'
import { DayPicker, type DayButtonProps, type Matcher } from 'react-day-picker'
import { cn } from '../../lib/cn'
import { composeRefs } from '../../lib/compose-refs'
import { ChevronLeftIcon, ChevronRightIcon } from '../../lib/icons'
import { useControlled } from '../../lib/use-controlled'
import { Button } from '../button/button'
import { IconButton } from '../icon-button/icon-button'
import { CalendarItem } from './calendar-item'

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const addDays = (date: Date, days: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
const addMonths = (date: Date, months: number) => {
  const first = new Date(date.getFullYear(), date.getMonth() + months, 1)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), last))
}
const isSameMonth = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()
const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`

export type CalendarLabels = {
  /** Accessible name of the button that goes to the previous month. */
  previousMonth: string
  /** Accessible name of the button that goes to the next month. */
  nextMonth: string
  /** Accessible name of the button that goes to the previous year, in the month view. */
  previousYear: string
  /** Accessible name of the button that goes to the next year, in the month view. */
  nextYear: string
  /** Accessible name of the whole calendar. */
  calendar: string
}

const defaultLabels: CalendarLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
  calendar: 'Calendar',
}

export type CalendarProps = Omit<ComponentProps<'div'>, 'defaultValue' | 'onChange'> & {
  /** The chosen date. Pass `null` for a controlled empty calendar. */
  value?: Date | null
  /** The date chosen at the start, for an uncontrolled calendar. */
  defaultValue?: Date | null
  /** Called with the date the user picks. */
  onValueChange?: (date: Date) => void
  /** The month on show; any date of it. Controls the shown month together with `onMonthChange`. */
  month?: Date
  /** The month on show at the start: the chosen date's month, or the current month. */
  defaultMonth?: Date
  /** Called when the shown month or year changes, with the first day of the new month. */
  onMonthChange?: (month: Date) => void
  /** `days` shows the day grid. `months` shows the 12 months of the year, opened with the caption button. */
  view?: 'days' | 'months'
  /** The view at the start, for an uncontrolled calendar. */
  defaultView?: 'days' | 'months'
  /** Called when the view changes. */
  onViewChange?: (view: 'days' | 'months') => void
  /** The earliest date that can be picked. Earlier dates are muted. */
  minDate?: Date
  /** The latest date that can be picked. Later dates are muted. */
  maxDate?: Date
  /** Dates that cannot be picked: a list of dates, or a function that returns `true` for a date to block. */
  disabledDates?: Date[] | ((date: Date) => boolean)
  /** Locale of the month and weekday names, a BCP 47 tag. */
  locale?: string
  /** The first day of the week, 0 for Sunday to 6 for Saturday. */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6
  /** Accessible names of the navigation buttons. Set them when the page is not in English. */
  labels?: Partial<CalendarLabels>
}

/**
 * Calendar: a month of days to pick one date from. The caption button switches to a grid of the 12
 * months; the arrows move by a month, or by a year in that view. Both views keep the same height.
 * Days of the neighbor months are muted and cannot be picked. The day grid is react-day-picker:
 * arrow keys move between days, Home and End go to the week edges, PageUp and PageDown change the
 * month (with Shift, the year), and the days skip what cannot be picked.
 */
export function Calendar({
  value,
  defaultValue,
  onValueChange,
  month,
  defaultMonth,
  onMonthChange,
  view,
  defaultView = 'days',
  onViewChange,
  minDate,
  maxDate,
  disabledDates,
  locale = 'en-US',
  weekStartsOn = 1,
  labels,
  className,
  ref,
  ...props
}: CalendarProps) {
  const text = { ...defaultLabels, ...labels }
  const root = useRef<HTMLDivElement>(null)
  const rootRef = useMemo(() => composeRefs(root, ref), [ref])
  const captionId = useId()

  const [selected, setSelected] = useControlled<Date | null>(
    value === undefined ? undefined : value && startOfDay(value),
    defaultValue ? startOfDay(defaultValue) : null,
    (next) => next && onValueChange?.(next),
  )
  const [shownDate, setShown] = useControlled<Date>(
    month && startOfMonth(month),
    startOfMonth(defaultMonth ?? selected ?? new Date()),
    onMonthChange,
  )
  const [currentView, setView] = useControlled<'days' | 'months'>(view, defaultView, onViewChange)
  const [focusedMonth, setFocusedMonth] = useState<number | null>(null)
  // The element to focus once the next render is in the DOM: a day (`data-date`) or a month (`data-month`).
  const pendingFocus = useRef<string | null>(null)

  useEffect(() => {
    if (!pendingFocus.current) return
    root.current?.querySelector<HTMLElement>(`[${pendingFocus.current}]`)?.focus()
    pendingFocus.current = null
  })

  const shown = startOfMonth(shownDate)
  const min = minDate && startOfDay(minDate)
  const max = maxDate && startOfDay(maxDate)

  // What cannot be picked: outside the limits and the blocked dates. The days of the neighbor months
  // are muted in the day button instead, so the keys can still move through them into the next month.
  const disabledDays: Matcher[] = [
    ...(min ? [{ before: min }] : []),
    ...(max ? [{ after: max }] : []),
    ...(disabledDates ? [disabledDates] : []),
  ]
  const isMonthDisabled = (year: number, index: number) => {
    const first = new Date(year, index, 1)
    const last = new Date(year, index + 1, 0)
    return Boolean((min && last < min) || (max && first > max))
  }

  const dateFormat = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options)
  const activeMonth =
    focusedMonth ??
    (selected && selected.getFullYear() === shown.getFullYear() ? selected.getMonth() : shown.getMonth())

  const inDays = currentView === 'days'
  const step = inDays ? 1 : 12
  const previousDisabled = inDays
    ? Boolean(min && addDays(shown, -1) < min)
    : Boolean(min && shown.getFullYear() <= min.getFullYear())
  const nextDisabled = inDays
    ? Boolean(max && addMonths(shown, 1) > max)
    : Boolean(max && shown.getFullYear() >= max.getFullYear())

  const moveMonth = (event: KeyboardEvent<HTMLDivElement>) => {
    const moves: Record<string, number> = {
      ArrowLeft: activeMonth - 1,
      ArrowRight: activeMonth + 1,
      ArrowUp: activeMonth - 4,
      ArrowDown: activeMonth + 4,
      Home: activeMonth - (activeMonth % 4),
      End: activeMonth - (activeMonth % 4) + 3,
    }
    const next = moves[event.key]
    if (next === undefined) return
    event.preventDefault()
    const index = Math.min(11, Math.max(0, next))
    setFocusedMonth(index)
    pendingFocus.current = `data-month="${index}"`
  }

  const chooseMonth = (index: number) => {
    const next = new Date(shown.getFullYear(), index, 1)
    const target = selected && isSameMonth(selected, next) ? selected : next
    setShown(next)
    setView('days')
    pendingFocus.current = `data-date="${dayKey(target)}"`
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label={text.calendar}
      data-slot="calendar"
      data-view={currentView}
      className={cn(
        'flex w-fit flex-col gap-2 rounded-lg border border-neutral-subtle bg-card-neutral-emphasized p-3 text-neutral shadow-md',
        className,
      )}
      {...props}
    >
      <div data-slot="calendar-header" className="flex h-8 items-center justify-between">
        <IconButton
          variant="ghost"
          tone="default"
          size="sm"
          aria-label={inDays ? text.previousMonth : text.previousYear}
          disabled={previousDisabled}
          onClick={() => setShown(addMonths(shown, -step))}
        >
          <ChevronLeftIcon />
        </IconButton>
        <Button
          variant="ghost"
          tone="default"
          size="sm"
          aria-expanded={!inDays}
          aria-controls={`${captionId}-months`}
          onClick={() => {
            setFocusedMonth(null)
            setView(inDays ? 'months' : 'days')
          }}
        >
          <span aria-live="polite">
            {inDays
              ? dateFormat({ month: 'long', year: 'numeric' }).format(shown)
              : dateFormat({ year: 'numeric' }).format(shown)}
          </span>
        </Button>
        <IconButton
          variant="ghost"
          tone="default"
          size="sm"
          aria-label={inDays ? text.nextMonth : text.nextYear}
          disabled={nextDisabled}
          onClick={() => setShown(addMonths(shown, step))}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>

      {/* Both views share one cell, so the calendar keeps the height of the taller one. The hidden view is inert. */}
      <div data-slot="calendar-views" className="grid">
        <div
          data-slot="calendar-days"
          inert={!inDays}
          className={cn('col-start-1 row-start-1', !inDays && 'invisible')}
        >
          <DayPicker
            mode="single"
            required
            selected={selected ?? undefined}
            onSelect={(date) => date && setSelected(startOfDay(date))}
            month={shown}
            onMonthChange={(next) => setShown(startOfMonth(next))}
            startMonth={min}
            endMonth={max}
            weekStartsOn={weekStartsOn}
            showOutsideDays
            hideNavigation
            disabled={disabledDays}
            formatters={{
              formatCaption: (date) => dateFormat({ month: 'long', year: 'numeric' }).format(date),
              formatWeekdayName: (date) =>
                Array.from(dateFormat({ weekday: 'short' }).format(date))
                  .slice(0, 2)
                  .join(''),
            }}
            labels={{
              labelGrid: (date) => dateFormat({ month: 'long', year: 'numeric' }).format(date),
              labelWeekday: (date) => dateFormat({ weekday: 'long' }).format(date),
              labelDayButton: (date) => dateFormat({ dateStyle: 'full' }).format(date),
            }}
            components={{ DayButton: CalendarDayButton }}
            classNames={{
              root: '',
              months: '',
              month: '',
              // The caption names the grid for assistive tech; the header shows the month.
              month_caption: 'sr-only',
              caption_label: '',
              month_grid: 'border-collapse',
              weekdays: 'mb-2 flex',
              weekday: 'flex w-8 items-center justify-center py-0.5 text-body-xsmall text-neutral-subtle',
              weeks: '',
              week: 'flex',
              day: 'flex size-8 p-0',
              day_button: '',
              today: '',
              selected: '',
              disabled: '',
              outside: '',
              hidden: 'invisible',
              focused: '',
            }}
          />
        </div>

        <div
          id={`${captionId}-months`}
          role="group"
          aria-label={dateFormat({ year: 'numeric' }).format(shown)}
          data-slot="calendar-months"
          inert={inDays}
          onKeyDown={moveMonth}
          className={cn('col-start-1 row-start-1 grid grid-cols-4 grid-rows-3 gap-2', inDays && 'invisible')}
        >
          {Array.from({ length: 12 }, (_, index) => {
            const first = new Date(shown.getFullYear(), index, 1)
            const isSelected = Boolean(selected && isSameMonth(selected, first))
            return (
              <CalendarItem
                key={index}
                label={dateFormat({ month: 'short' }).format(first)}
                aria-label={dateFormat({ month: 'long', year: 'numeric' }).format(first)}
                aria-pressed={isSelected}
                data-month={index}
                tabIndex={index === activeMonth ? 0 : -1}
                selected={isSelected}
                disabled={isMonthDisabled(shown.getFullYear(), index)}
                className="size-full"
                onClick={() => chooseMonth(index)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}

/** One day of the grid: a Calendar Item, with the focus react-day-picker moves between days. */
function CalendarDayButton({ day, modifiers, disabled, ...props }: DayButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])
  return (
    <CalendarItem
      ref={ref}
      {...props}
      label={day.date.getDate()}
      data-date={dayKey(day.date)}
      aria-current={modifiers.today ? 'date' : undefined}
      selected={Boolean(modifiers.selected)}
      disabled={Boolean(disabled || modifiers.disabled || modifiers.outside)}
    />
  )
}
