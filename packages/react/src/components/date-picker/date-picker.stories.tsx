import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { CalendarIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { Field } from '../field/field'
import { IconButton } from '../icon-button/icon-button'
import { Input } from '../input/input'
import { Calendar } from './calendar'
import { CalendarItem } from './calendar-item'
import { DatePicker } from './date-picker'

// A fixed date, so the stories and the screenshots do not change with the day they are opened.
const picked = new Date(2026, 10, 18)
const formatted = 'Nov 18, 2026'

const meta = {
  title: 'Components/Date Picker',
  component: DatePicker,
  args: { placeholder: 'Pick a date', locale: 'en-US', weekStartsOn: 1, disabled: false },
  argTypes: {
    weekStartsOn: { control: 'inline-radio', options: [0, 1, 6] },
    // The date is a Date object, which the controls panel cannot edit: use the story's own calendar.
    value: { control: false },
    defaultValue: { control: false },
    minDate: { control: false },
    maxDate: { control: false },
    disabledDates: { control: false },
    popoverTrigger: { control: false },
  },
  parameters: { docs: { page: DocsPage } },
  decorators: [
    (Story) => (
      <div className="min-h-96 w-62">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

/** Open the calendar from the field, pick a day, and the field shows it. Escape closes the calendar. */
export const Playground: Story = {
  render: (args) => (
    <Field label="Date">
      <DatePicker {...args} />
    </Field>
  ),
}

const itemStates = ['default', 'hover', 'focus', 'active'] as const

/**
 * Every state of the Calendar Item, enabled and disabled, then the Calendar in both views. Hover and
 * focus are frozen with `state`; the disabled row uses `disabled`.
 */
export const Variants: Story = {
  decorators: [],
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="inline-grid grid-cols-[auto_repeat(4,max-content)] items-center gap-x-6 gap-y-3">
        <span />
        {itemStates.map((state) => (
          <span key={state} className="text-caption text-neutral-subtle">
            {state}
          </span>
        ))}
        {[false, true].map((disabled) => (
          <div key={String(disabled)} className="contents">
            <span className="text-caption text-neutral-subtle">{disabled ? 'disabled' : 'enabled'}</span>
            {itemStates.map((state) => (
              <CalendarItem
                key={state}
                label="18"
                aria-label={`18, ${state}${disabled ? ', disabled' : ''}`}
                state={state}
                disabled={disabled}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-start gap-6">
        <Calendar defaultValue={picked} defaultMonth={picked} aria-label="Calendar, days" />
        <Calendar defaultValue={picked} defaultMonth={picked} defaultView="months" aria-label="Calendar, months" />
      </div>
    </div>
  ),
}

/** The calendar on its own, in the page. The caption button opens the month view; the arrows move by a month, or by a year there. */
export const CalendarOnly: Story = {
  decorators: [],
  render: () => <Calendar defaultValue={picked} defaultMonth={picked} />,
}

/** `minDate`, `maxDate` and `disabledDates` mute the days that cannot be picked; the arrows stop at the limits. */
export const WithLimits: Story = {
  decorators: [],
  render: () => (
    <Calendar
      defaultValue={picked}
      defaultMonth={picked}
      minDate={new Date(2026, 10, 5)}
      maxDate={new Date(2026, 11, 20)}
      disabledDates={(date) => date.getDay() === 0 || date.getDay() === 6}
    />
  ),
}

/** In a Field the trigger takes the id, the caption and the disabled state from it. */
export const InField: Story = {
  render: (args) => (
    <Field label="Start date" caption="The day the plan begins.">
      <DatePicker {...args} defaultValue={picked} />
    </Field>
  ),
}

/** A Field with an `error` marks the trigger invalid (`aria-invalid`). */
export const Invalid: Story = {
  render: (args) => (
    <Field label="Start date" error="Pick a date to continue.">
      <DatePicker {...args} />
    </Field>
  ),
}

/** The trigger is disabled and does not open the calendar. */
export const Disabled: Story = {
  render: (args) => (
    <Field label="Start date" disabled>
      <DatePicker {...args} defaultValue={picked} />
    </Field>
  ),
}

/** `popoverTrigger` swaps the Input for any control: a Button here, an IconButton below. It shows the date itself. */
export const CustomTrigger: Story = {
  decorators: [],
  render: (args) => {
    const [date, setDate] = useState<Date | null>(null)
    return (
      <div className="flex min-h-96 items-start gap-3">
        <DatePicker
          {...args}
          value={date}
          onValueChange={setDate}
          popoverTrigger={
            <Button variant="outline" tone="default" size="sm" leadingSlot={<CalendarIcon />}>
              {date ? date.toLocaleDateString('en-US', { dateStyle: 'medium' }) : 'Pick a date'}
            </Button>
          }
        />
        <DatePicker
          {...args}
          popoverTrigger={
            <IconButton variant="outline" tone="default" size="sm" aria-label="Choose a date">
              <CalendarIcon />
            </IconButton>
          }
        />
      </div>
    )
  },
}

/**
 * **Show the picked date in the input**  
 * The calendar highlights a date, so the input must carry the same value instead of the placeholder.
 */
export const GuidelineShowThePickedDateDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  decorators: [],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="flex w-62 flex-col gap-1">
        <Field label="Date">
          <Input readOnly value={formatted} leadingSlot={<CalendarIcon />} />
        </Field>
        <Calendar defaultValue={picked} defaultMonth={picked} />
      </div>
    </Specimen>
  ),
}

export const GuidelineShowThePickedDateDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  decorators: [],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="flex w-62 flex-col gap-1">
        <Field label="Date">
          <Input readOnly value="" placeholder="Pick a date" leadingSlot={<CalendarIcon />} />
        </Field>
        <Calendar defaultValue={picked} defaultMonth={picked} />
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  const rules = [[GuidelineShowThePickedDateDo, GuidelineShowThePickedDateDont]] as const
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <GuidelinePairs rules={rules} />
    </>
  )
}
