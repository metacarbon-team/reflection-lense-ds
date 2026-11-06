import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId, useState } from 'react'
import { useArgs } from 'storybook/preview-api'
import { Guideline, Section } from '../../docs/guidelines'
import { Field } from '../field/field'
import { Checkbox } from './checkbox'

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { 'aria-label': 'Subscribe', checked: false, state: 'default', disabled: false },
  argTypes: {
    checked: { control: 'inline-radio', options: [false, true, 'indeterminate'] },
    state: { control: 'inline-radio', options: ['default', 'hover', 'focus', 'error', 'disabled'] },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

/** Click the box or use the controls: both change `checked`. */
export const Playground: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return <Checkbox {...args} onCheckedChange={(checked) => updateArgs({ checked })} />
  },
}

const selections = ['unchecked', 'checked', 'indeterminate'] as const
const checkedOf = { unchecked: false, checked: true, indeterminate: 'indeterminate' } as const
const states = ['default', 'hover', 'focus', 'error', 'disabled'] as const

/** Every selection in every state. Hover and focus are frozen with `state`. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(3,max-content)] items-center gap-x-8 gap-y-4">
      <span />
      {selections.map((selection) => (
        <span key={selection} className="text-caption text-neutral-subtle">
          {selection}
        </span>
      ))}
      {states.map((state) => (
        <div key={state} className="contents">
          <span className="text-caption text-neutral-subtle">{state}</span>
          {selections.map((selection) => (
            <Checkbox
              key={selection}
              {...args}
              aria-label={`${selection}, ${state}`}
              checked={checkedOf[selection]}
              state={state}
            />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Named by a visible label. */
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="checkbox-terms" />
      <label htmlFor="checkbox-terms" className="text-body-small">
        Accept the terms
      </label>
    </div>
  ),
}

/** In a Field the error message marks the checkbox invalid and wires `aria-describedby`. */
export const InvalidInField: Story = {
  render: () => (
    <Field label="Terms" error="Accept the terms to continue.">
      <Checkbox />
    </Field>
  ),
}

const options = ['Product updates', 'Weekly digest', 'Security alerts', 'Billing reminders']

/** A parent over a list: all selected is checked, none is unchecked, a part is indeterminate. */
export const IndeterminateGroup: Story = {
  render: function Render() {
    const [selected, setSelected] = useState(options.slice(0, 2))
    const parent = selected.length === options.length ? true : selected.length === 0 ? false : 'indeterminate'
    return (
      <div className="flex w-70 flex-col gap-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="notifications-all"
            checked={parent}
            onCheckedChange={(on) => setSelected(on === true ? options : [])}
          />
          <label htmlFor="notifications-all" className="text-label">
            Email notifications
          </label>
        </div>
        <div className="flex flex-col gap-3 pl-7">
          {options.map((option) => (
            <div key={option} className="flex items-center gap-2">
              <Checkbox
                id={`notifications-${option}`}
                checked={selected.includes(option)}
                onCheckedChange={(on) =>
                  setSelected((s) => (on === true ? [...s, option] : s.filter((x) => x !== option)))
                }
              />
              <label htmlFor={`notifications-${option}`} className="text-body-small">
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
    )
  },
}

const notifications = [
  { id: 'product', label: 'Product updates', hint: 'New features, once a month' },
  { id: 'digest', label: 'Weekly digest', hint: 'Summary of activity in your workspace' },
  { id: 'security', label: 'Security alerts', hint: 'New sign-ins and password changes' },
  { id: 'billing', label: 'Billing reminders', hint: 'Upcoming payments and failed charges' },
]

/** The parent over four children, two of them selected. `mirror` makes the parent follow its children. */
function NotificationList({ mirror }: { mirror: boolean }) {
  const prefix = useId()
  const [selected, setSelected] = useState(['product', 'digest'])
  const parent = mirror
    ? selected.length === notifications.length
      ? true
      : selected.length === 0
        ? false
        : 'indeterminate'
    : true
  return (
    <div className="flex w-full max-w-104 flex-col rounded-xl border border-neutral-subtle bg-card-neutral-emphasized p-4 shadow-sm">
      <div className="flex items-center gap-2 px-4 py-3">
        <Checkbox
          id={`${prefix}-parent`}
          checked={parent}
          onCheckedChange={(on) => setSelected(on === true ? notifications.map((n) => n.id) : [])}
        />
        <label htmlFor={`${prefix}-parent`} className="text-label-large flex-1 text-neutral">
          Email notifications
        </label>
        <span className="text-body-small text-neutral-subtle">{selected.length} of 4 selected</span>
      </div>
      <div className="flex flex-col pl-8">
        {notifications.map((n) => (
          <div key={n.id} className="flex flex-col px-4 py-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id={`${prefix}-${n.id}`}
                checked={selected.includes(n.id)}
                onCheckedChange={(on) =>
                  setSelected((s) => (on === true ? [...s, n.id] : s.filter((id) => id !== n.id)))
                }
              />
              <label htmlFor={`${prefix}-${n.id}`} className="text-label-large text-neutral">
                {n.label}
              </label>
            </div>
            <p className="pl-7 text-body-small text-neutral-subtle">{n.hint}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Usage rules for the Checkbox, from the Figma page "07. Checkbox". */
export const Documentation: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="flex max-w-240 flex-col gap-12 text-neutral">
      <header className="flex flex-col gap-2">
        <h1 className="text-heading-large">Checkbox</h1>
        <p className="text-body text-neutral-subtle">
          A single boolean control with a value (unchecked, checked, indeterminate) and a state.
        </p>
      </header>
      <Section title="Guidelines">
        <Guideline
          rule="Use indeterminate only for a partly selected group."
          comment="Indeterminate marks a parent whose children are only partly selected. If all children are selected the parent is checked; if none, unchecked."
          doExample={<NotificationList mirror />}
          dontExample={<NotificationList mirror={false} />}
        />
      </Section>
    </div>
  ),
}
