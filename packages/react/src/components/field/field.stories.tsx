import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from '../input/input'
import { Field } from './field'

const meta = {
  title: 'Components/Field',
  component: Field,
  args: { label: 'Email', caption: 'Used for sign-in only.', children: <Input placeholder="name@example.com" /> },
  argTypes: { children: { control: false } },
  decorators: [(Story) => <div className="w-70">{Story()}</div>],
} satisfies Meta<typeof Field>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

/** `error` replaces the caption and marks the control invalid (`aria-invalid`, danger stroke). */
export const Invalid: Story = { args: { error: 'Enter a valid email address.' } }

export const Disabled: Story = { args: { disabled: true } }

export const WithCounter: Story = { args: { label: 'Name', caption: 'Shown on your profile.', counter: '0/40' } }
