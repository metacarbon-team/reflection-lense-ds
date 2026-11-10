import { Canvas, Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useId, useState, type ReactNode } from 'react'
import { Field } from '../field/field'
import { Item } from '../item'
import { ItemList } from '../item-list'
import { Radio, RadioGroup, type RadioProps } from './radio'

type PlaygroundArgs = RadioProps & { checked: boolean }

const meta = {
  title: 'Components/Radio',
  component: Radio,
  args: { 'aria-label': 'Option', value: 'option', checked: false, state: 'default', disabled: false },
  argTypes: {
    checked: { control: 'boolean' },
    state: { control: 'inline-radio', options: ['default', 'hover', 'focus', 'error'] },
  },
  parameters: { docs: { page: DocsPage } },
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

/** Every selection in every state. Hover and focus are frozen with `state`; the disabled row uses `disabled`. */
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
              <Radio
                value="on"
                state={state === 'disabled' ? 'default' : state}
                disabled={state === 'disabled'}
                aria-label={`${selection}, ${state}`}
              />
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

/** A Do or Don't badge attached to the top of the card, as in Figma, over the example. */
function Specimen({ tone, children }: { tone: 'do' | 'dont'; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <span
        className={
          tone === 'do'
            ? 'm-1 rounded-sm border-b border-success bg-card-success px-2 py-0.5 text-caption text-success uppercase'
            : 'm-1 rounded-sm border-b border-danger bg-card-danger px-2 py-0.5 text-caption text-danger uppercase'
        }
      >
        {tone === 'do' ? 'Do' : 'Don’t'}
      </span>
      <div className="flex justify-center px-6 pb-6">{children}</div>
    </div>
  )
}

const deliveryOptions = [
  { id: 'standard', label: 'Standard delivery', description: '3–5 business days', metaLabel: 'Free' },
  { id: 'express', label: 'Express delivery', description: '1–2 business days', metaLabel: '$9.99' },
  {
    id: 'next-day',
    label: 'Next-day delivery',
    description: 'Order before 2 PM for delivery tomorrow',
    metaLabel: '$24.99',
  },
]

/** One group: choosing a row moves the selection, so exactly one radio is selected. */
function DeliveryDo() {
  const prefix = useId()
  return (
    <RadioGroup asChild defaultValue="express" aria-label="Delivery method" className="gap-0">
      <ItemList className="max-w-96">
        {deliveryOptions.map((option) => (
          <Item
            key={option.id}
            size="lg"
            label={option.label}
            description={option.description}
            metaLabel={option.metaLabel}
            htmlFor={`${prefix}-${option.id}`}
            leadingSlot={<Radio id={`${prefix}-${option.id}`} value={option.id} />}
          />
        ))}
      </ItemList>
    </RadioGroup>
  )
}

/** A group holds one value, so two selected radios take one `RadioGroup` each: the rows no longer exclude each other. */
function DeliveryDont() {
  const prefix = useId()
  return (
    <ItemList className="max-w-96">
      {deliveryOptions.map((option) => (
        <RadioGroup
          key={option.id}
          asChild
          defaultValue={option.id === 'next-day' ? undefined : option.id}
          aria-label={option.label}
          className="gap-0"
        >
          <Item
            size="lg"
            label={option.label}
            description={option.description}
            metaLabel={option.metaLabel}
            htmlFor={`${prefix}-${option.id}`}
            leadingSlot={<Radio id={`${prefix}-${option.id}`} value={option.id} />}
          />
        </RadioGroup>
      ))}
    </ItemList>
  )
}

/** Select only one radio in a group. Inside a group only one option can be selected at a time. */
export const GuidelineDo: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <DeliveryDo />
    </Specimen>
  ),
}

export const GuidelineDont: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <DeliveryDont />
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <div className="-mt-2! grid grid-cols-2 gap-x-6 [&_p]:mb-0!">
        <div className="row-span-3 grid grid-rows-subgrid">
          <Description of={GuidelineDo} />
          <Canvas of={GuidelineDo} />
        </div>
        <div className="row-span-3 grid grid-rows-subgrid">
          {/* Figma has no Don't caption: the wrapper keeps the empty row so both cards stay level. */}
          <div>
            <Description of={GuidelineDont} />
          </div>
          <Canvas of={GuidelineDont} />
        </div>
      </div>
    </>
  )
}
