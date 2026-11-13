import { useEffect, useId, useMemo, useRef, useState, type ComponentProps, type KeyboardEvent } from 'react'
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
const isSameDay = (a: Date, b: Date) => a.getTime() === b.getTime()
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
}

const defaultLabels: CalendarLabels = {
  previousMonth: 'Previous month',
  nextMonth: 'Next month',
  previousYear: 'Previous year',
  nextYear: 'Next year',
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
 * Days of the neighbor months are muted and cannot be picked. Arrow keys move between days, Home and
 * End go to the week edges, PageUp and PageDown change the month (with Shift, the year).
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
  const [focusedDay, setFocusedDay] = useState<Date | null>(null)
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
  const today = startOfDay(new Date())

  const isDateDisabled = (date: Date) => {
    if ((min && date < min) || (max && date > max)) return true
    if (typeof disabledDates === 'function') return disabledDates(date)
    return disabledDates?.some((blocked) => isSameDay(startOfDay(blocked), date)) ?? false
  }
  const isMonthDisabled = (year: number, index: number) => {
    const first = new Date(year, index, 1)
    const last = new Date(year, index + 1, 0)
    return Boolean((min && last < min) || (max && first > max))
  }

  const dateFormat = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options)
  const offset = (shown.getDay() - weekStartsOn + 7) % 7
  const daysInMonth = new Date(shown.getFullYear(), shown.getMonth() + 1, 0).getDate()
  const gridStart = addDays(shown, -offset)
  const weeks = Array.from({ length: Math.ceil((offset + daysInMonth) / 7) }, (_, row) =>
    Array.from({ length: 7 }, (_, column) => addDays(gridStart, row * 7 + column)),
  )

  // The one day in the tab order: the day the keys moved to, else the chosen day, else the first.
  const activeDay =
    focusedDay && isSameMonth(focusedDay, shown)
      ? focusedDay
      : selected && isSameMonth(selected, shown)
        ? selected
        : shown
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

  const moveDay = (event: KeyboardEvent<HTMLDivElement>) => {
    const weekStart = addDays(activeDay, -((activeDay.getDay() - weekStartsOn + 7) % 7))
    const moves: Record<string, Date> = {
      ArrowLeft: addDays(activeDay, -1),
      ArrowRight: addDays(activeDay, 1),
      ArrowUp: addDays(activeDay, -7),
      ArrowDown: addDays(activeDay, 7),
      Home: weekStart,
      End: addDays(weekStart, 6),
      PageUp: addMonths(activeDay, event.shiftKey ? -12 : -1),
      PageDown: addMonths(activeDay, event.shiftKey ? 12 : 1),
    }
    let next = moves[event.key]
    if (!next) return
    event.preventDefault()
    if (min && next < min) next = min
    if (max && next > max) next = max
    setFocusedDay(next)
    if (!isSameMonth(next, shown)) setShown(startOfMonth(next))
    pendingFocus.current = `data-date="${dayKey(next)}"`
  }

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
    setFocusedDay(target)
    setView('days')
    pendingFocus.current = `data-date="${dayKey(target)}"`
  }

  return (
    <div
      ref={rootRef}
      role="group"
      aria-label="Calendar"
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
      <div className="grid">
        <div
          role="grid"
          aria-label={dateFormat({ month: 'long', year: 'numeric' }).format(shown)}
          data-slot="calendar-days"
          inert={!inDays}
          onKeyDown={moveDay}
          className={cn('col-start-1 row-start-1 flex flex-col', !inDays && 'invisible')}
        >
          <div role="row" className="mb-2 flex">
            {(weeks[0] ?? []).map((date) => (
              <div
                key={date.getDay()}
                role="columnheader"
                aria-label={dateFormat({ weekday: 'long' }).format(date)}
                className="flex w-8 items-center justify-center py-0.5 text-body-xsmall text-neutral-subtle"
              >
                {Array.from(dateFormat({ weekday: 'short' }).format(date))
                  .slice(0, 2)
                  .join('')}
              </div>
            ))}
          </div>
          {weeks.map((week, row) => (
            <div key={row} role="row" className="flex">
              {week.map((date) => {
                const outside = !isSameMonth(date, shown)
                const isSelected = Boolean(selected && isSameDay(selected, date))
                return (
                  <div key={dayKey(date)} role="gridcell" aria-selected={isSelected} className="flex">
                    <CalendarItem
                      label={date.getDate()}
                      aria-label={dateFormat({ dateStyle: 'full' }).format(date)}
                      aria-current={isSameDay(date, today) ? 'date' : undefined}
                      data-date={dayKey(date)}
                      tabIndex={isSameDay(date, activeDay) ? 0 : -1}
                      selected={isSelected}
                      disabled={outside || isDateDisabled(date)}
                      onClick={() => {
                        setFocusedDay(date)
                        setSelected(date)
                      }}
                    />
                  </div>
                )
              })}
            </div>
          ))}
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
