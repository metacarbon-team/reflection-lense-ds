import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './icon-button'

const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const meta = {
  title: 'Components/IconButton',
  component: IconButton,
  args: { 'aria-label': 'Add', tone: 'default', variant: 'ghost', size: 'md', disabled: false, children: <Plus /> },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'accent', 'danger'] },
    variant: { control: 'inline-radio', options: ['solid', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    children: { control: false },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every tone and variant; the last column is disabled. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(4,max-content)] items-center gap-3">
      {(['solid', 'outline', 'ghost'] as const).map((variant) => (
        <div key={variant} className="contents">
          <span className="text-caption text-neutral-subtle">{variant}</span>
          {(['default', 'accent', 'danger'] as const).map((tone) => (
            <IconButton key={tone} {...args} variant={variant} tone={tone} aria-label={`Add, ${tone}`} />
          ))}
          <IconButton {...args} variant={variant} disabled aria-label="Add, disabled" />
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <IconButton key={size} {...args} variant="outline" size={size} aria-label={`Add, ${size}`} />
      ))}
    </div>
  ),
}
