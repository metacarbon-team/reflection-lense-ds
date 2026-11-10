import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { Checkbox } from '../checkbox'
import { RadioGroup, Radio } from '../radio'
import { Switch } from '../switch'
import { ChevronRightIcon } from '../../lib/icons'
import { Item } from './item'

const FileIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M9 2H4.5A1.5 1.5 0 0 0 3 3.5v9A1.5 1.5 0 0 0 4.5 14h7a1.5 1.5 0 0 0 1.5-1.5V6L9 2Z" />
    <path d="M9 2v4h4" />
  </svg>
)

// The slot controls pick ready-made content; Storybook swaps the option for the element before render.
const leadingSlots = {
  none: null,
  icon: <FileIcon />,
  checkbox: <Checkbox aria-label="Select row" />,
  radio: <Radio value="row" aria-label="Choose row" />,
}
const trailingSlots = {
  none: null,
  chevron: <ChevronRightIcon />,
  switch: <Switch aria-label="Enable row" />,
}

const meta = {
  title: 'Components/Item',
  component: Item,
  args: {
    label: 'Title',
    description: 'Description',
    metaLabel: 'Meta',
    errorLabel: '',
    leadingSlot: 'icon',
    trailingSlot: 'chevron',
    divider: false,
    size: 'md',
    state: 'default',
    disabled: false,
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    metaLabel: { control: 'text' },
    errorLabel: { control: 'text' },
    leadingSlot: { control: 'select', options: Object.keys(leadingSlots), mapping: leadingSlots },
    trailingSlot: { control: 'select', options: Object.keys(trailingSlots), mapping: trailingSlots },
    divider: { control: 'boolean' },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    state: { control: 'select', options: ['default', 'hover', 'pressed', 'active', 'focus'] },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof Item>

export default meta
type Story = StoryObj<typeof meta>

/** A radio in the leading slot needs a `RadioGroup` around it, so the Playground sits inside one. */
export const Playground: Story = {
  render: (args) => (
    <RadioGroup aria-label="Playground" className="w-80">
      <Item {...args} />
    </RadioGroup>
  ),
}

const stateRows: { name: string; props: Partial<ComponentProps<typeof Item>> }[] = [
  { name: 'default', props: {} },
  { name: 'default + divider', props: { divider: true } },
  { name: 'default + error', props: { errorLabel: 'error message' } },
  { name: 'hover', props: { state: 'hover' } },
  { name: 'pressed', props: { state: 'pressed' } },
  { name: 'active', props: { state: 'active' } },
  { name: 'focus', props: { state: 'focus' } },
  { name: 'disabled', props: { disabled: true } },
]

/** Every state at each size, plus the divider and the error label. Hover, pressed and focus are frozen with `state`. */
export const States: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(3,20rem)] items-center gap-x-3 gap-y-2">
      <span />
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <span key={size} className="text-caption text-neutral-subtle">
          {size}
        </span>
      ))}
      {stateRows.map(({ name, props }) => (
        <div key={name} className="contents">
          <span className="text-caption text-neutral-subtle">{name}</span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <Item
              key={size}
              {...args}
              errorLabel=""
              divider={false}
              size={size}
              state="default"
              leadingSlot={leadingSlots.icon}
              trailingSlot={trailingSlots.chevron}
              {...props}
            />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Only the title. Everything else is hidden when it is not set. */
export const TitleOnly: Story = {
  render: () => (
    <div className="w-80">
      <Item label="Title" />
    </div>
  ),
}

/** A checkbox or radio in the leading slot, a switch in the trailing slot. Give the control an `id` and the row the same `htmlFor`: a click anywhere on the row toggles it. */
export const WithControls: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-4">
      <div className="flex flex-col">
        <Item
          size="lg"
          label="Email me updates"
          description="Product news once a month."
          htmlFor="item-email-updates"
          leadingSlot={<Checkbox id="item-email-updates" />}
        />
        <Item
          size="lg"
          label="Share usage data"
          description="Helps us find what to fix."
          htmlFor="item-usage-data"
          leadingSlot={<Checkbox id="item-usage-data" defaultChecked />}
        />
      </div>
      <RadioGroup defaultValue="standard" aria-label="Delivery method" className="gap-0">
        <Item
          size="lg"
          label="Standard delivery"
          description="3 to 5 days."
          metaLabel="Free"
          htmlFor="item-standard"
          leadingSlot={<Radio id="item-standard" value="standard" />}
        />
        <Item
          size="lg"
          label="Express delivery"
          description="Next day."
          metaLabel="$9"
          htmlFor="item-express"
          leadingSlot={<Radio id="item-express" value="express" />}
        />
      </RadioGroup>
      <Item
        size="lg"
        label="Dark mode"
        description="Follow the system setting."
        htmlFor="item-dark-mode"
        trailingSlot={<Switch id="item-dark-mode" defaultChecked />}
      />
    </div>
  ),
}

/** The error label shows in the danger color under the description. */
export const WithError: Story = {
  render: () => (
    <div className="w-80">
      <Item
        size="lg"
        label="Billing address"
        description="Where we send invoices."
        errorLabel="Add a street and a postal code."
        leadingSlot={<FileIcon />}
        trailingSlot={<ChevronRightIcon />}
      />
    </div>
  ),
}

/** Long text is cut: the title and the error to one line, the description to two. */
export const LongText: Story = {
  render: () => (
    <div className="w-80">
      <Item
        size="lg"
        label="A title that is much too long to fit in one line of the row"
        description="A description that runs past two lines is cut with an ellipsis, so the row never grows beyond its limit and the list keeps its rhythm."
        errorLabel="An error message that is too long for one line is cut with an ellipsis."
        metaLabel="Meta"
        leadingSlot={<FileIcon />}
        divider
      />
    </div>
  ),
}

/** A disabled row dims all its text and ignores the pointer. */
export const Disabled: Story = {
  render: () => (
    <div className="w-80">
      <Item
        size="lg"
        label="Archived project"
        description="Read only."
        metaLabel="Locked"
        leadingSlot={<FileIcon />}
        trailingSlot={<ChevronRightIcon />}
        disabled
      />
    </div>
  ),
}
