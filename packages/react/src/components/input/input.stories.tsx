import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'

const Search = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </svg>
)

const meta = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: 'Placeholder', 'aria-label': 'Example', disabled: false },
  decorators: [(Story) => <div className="w-70">{Story()}</div>],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
export const Filled: Story = { args: { defaultValue: 'Value' } }
export const Invalid: Story = { args: { 'aria-invalid': true, defaultValue: 'not-an-email' } }
export const Disabled: Story = { args: { disabled: true } }

/** Leading content, as in the search type. */
export const WithLeading: Story = { args: { type: 'search', placeholder: 'Search', leading: <Search /> } }

/** Trailing content, as in the metric type. */
export const WithTrailing: Story = {
  args: { inputMode: 'decimal', placeholder: '0', trailing: <span className="text-body-small">kg</span> },
}
