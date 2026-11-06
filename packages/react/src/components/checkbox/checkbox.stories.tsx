import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Field } from '../field/field'
import { Checkbox, type CheckboxProps } from './checkbox'

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

export const Playground: Story = {
  render: function Render({ checked: initial, ...args }) {
    const [checked, setChecked] = useState<CheckboxProps['checked']>(initial)
    return <Checkbox {...args} checked={checked} onCheckedChange={setChecked} />
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
