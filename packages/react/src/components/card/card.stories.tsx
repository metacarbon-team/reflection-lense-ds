import type { Meta, StoryObj } from '@storybook/react-vite'
import { Card } from './card'

const meta = {
  title: 'Components/Card',
  component: Card,
  args: { tone: 'default', padding: 'md' },
  argTypes: {
    tone: { control: 'select', options: ['default', 'subtle', 'success', 'warning', 'danger', 'info'] },
    padding: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg'] },
  },
  render: (args) => (
    <Card {...args} className="w-80">
      <p className="text-label-large">Card title</p>
      <p className="text-body-small text-neutral-subtle">Cards group related content on the surface.</p>
    </Card>
  ),
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Tones: Story = {
  render: (args) => (
    <div className="grid grid-cols-3 gap-4">
      {(['default', 'subtle', 'success', 'warning', 'danger', 'info'] as const).map((tone) => (
        <Card key={tone} {...args} tone={tone}>
          <p className="text-label-large">{tone}</p>
          <p className="text-body-small text-neutral-subtle">Card content.</p>
        </Card>
      ))}
    </div>
  ),
}

export const Paddings: Story = {
  render: (args) => (
    <div className="flex items-start gap-4">
      {(['none', 'sm', 'md', 'lg'] as const).map((padding) => (
        <Card key={padding} {...args} padding={padding}>
          <p className="text-label">padding {padding}</p>
          <p className="text-body-small text-neutral-subtle">Second line.</p>
        </Card>
      ))}
    </div>
  ),
}
