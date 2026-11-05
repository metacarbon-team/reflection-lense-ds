import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge } from './badge'

const TONES = ['default', 'accent', 'success', 'warning', 'danger', 'info', 'inverse'] as const

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: '9', tone: 'default', variant: 'solid', size: 'md', dot: false, disabled: false },
  argTypes: {
    tone: { control: 'select', options: TONES },
    variant: { control: 'inline-radio', options: ['solid', 'ghost'] },
    size: { control: 'inline-radio', options: ['md', 'sm'] },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Counts and dots in every tone, at both sizes. */
export const Tones: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[repeat(7,max-content)] items-center gap-3">
      {(['md', 'sm'] as const).flatMap((size) => [
        ...TONES.map((tone) => <Badge key={`${size}-${tone}`} {...args} tone={tone} size={size} />),
        ...TONES.map((tone) => (
          <Badge key={`${size}-${tone}-dot`} {...args} tone={tone} size={size} dot aria-label={`${tone} status`} />
        )),
      ])}
    </div>
  ),
}

export const GhostAndDisabled: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Badge {...args} variant="ghost" />
      <Badge {...args} disabled />
      <Badge {...args} variant="ghost" disabled />
      <Badge {...args} dot disabled aria-label="Disabled status" />
    </div>
  ),
}
