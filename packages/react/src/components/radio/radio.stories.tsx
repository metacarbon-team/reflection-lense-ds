import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Field } from '../field/field'
import { Radio, RadioGroup, type RadioProps } from './radio'

type PlaygroundArgs = RadioProps & { checked: boolean }

const meta = {
  title: 'Components/Radio',
  component: Radio,
  args: { 'aria-label': 'Option', value: 'option', checked: false, state: 'default', disabled: false },
  argTypes: {
    checked: { control: 'boolean' },
    state: { control: 'inline-radio', options: ['default', 'hover', 'focus', 'error', 'disabled'] },
  },
} satisfies Meta<PlaygroundArgs>

export default meta
type Story = StoryObj<typeof meta>

function PlaygroundRadio({ checked: initial, ...args }: RadioProps & { checked?: boolean }) {
  const [value, setValue] = useState(initial ? args.value : '')
  return (
    <RadioGroup value={value} onValueChange={setValue} aria-label="Playground">
      <Radio {...args} />
    </RadioGroup>
  )
}

/**
 * One radio in its own group; `checked` mirrors the Figma `selection` property. Click it to select;
 * a selected radio only changes by choosing another option, so use the control to clear it.
 */
export const Playground: Story = {
  // The key restarts the radio when the `checked` control changes.
  render: (args) => <PlaygroundRadio key={String(args.checked)} {...args} />,
}

const selections = ['unchecked', 'checked'] as const
const states = ['default', 'hover', 'focus', 'error', 'disabled'] as const

/** Every selection in every state. Hover and focus are frozen with `state`. */
export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(2,max-content)] items-center gap-x-8 gap-y-4">
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
            <RadioGroup
              key={selection}
              value={selection === 'checked' ? 'on' : ''}
              aria-label={`${selection}, ${state}`}
            >
              <Radio value="on" state={state} aria-label={`${selection}, ${state}`} />
            </RadioGroup>
          ))}
        </div>
      ))}
    </div>
  ),
}

const delivery = [
  { value: 'standard', label: 'Standard delivery' },
  { value: 'express', label: 'Express delivery' },
  { value: 'next-day', label: 'Next-day delivery' },
]

/** Named by a visible label; only one option can be selected. */
export const WithLabel: Story = {
  render: function Render() {
    const [value, setValue] = useState('express')
    return (
      <RadioGroup value={value} onValueChange={setValue} aria-label="Delivery method">
        {delivery.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Radio id={`radio-${option.value}`} value={option.value} />
            <label htmlFor={`radio-${option.value}`} className="text-body-small">
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup>
    )
  },
}

/** `aria-invalid` marks a radio as an error, for a group with no choice made. */
export const Invalid: Story = {
  render: () => (
    <RadioGroup aria-label="Delivery method" aria-required>
      {delivery.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <Radio id={`radio-invalid-${option.value}`} value={option.value} aria-invalid />
          <label htmlFor={`radio-invalid-${option.value}`} className="text-body-small">
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  ),
}

/** `disabled` on the group disables every radio, selected or not. */
export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="express" disabled aria-label="Delivery method">
      {delivery.map((option) => (
        <div key={option.value} className="flex items-center gap-2">
          <Radio id={`radio-disabled-${option.value}`} value={option.value} />
          <label htmlFor={`radio-disabled-${option.value}`} className="text-body-small text-disabled">
            {option.label}
          </label>
        </div>
      ))}
    </RadioGroup>
  ),
}

/** In a Field the error message marks the group invalid, wires `aria-describedby`, and every radio shows the error. */
export const InvalidInField: Story = {
  render: () => (
    <Field label="Delivery method" error="Choose a delivery method to continue.">
      <RadioGroup aria-label="Delivery method">
        {delivery.map((option) => (
          <div key={option.value} className="flex items-center gap-2">
            <Radio id={`radio-field-${option.value}`} value={option.value} />
            <label htmlFor={`radio-field-${option.value}`} className="text-body-small">
              {option.label}
            </label>
          </div>
        ))}
      </RadioGroup>
    </Field>
  ),
}
