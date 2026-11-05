import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button', tone: 'default', variant: 'outline', size: 'md', disabled: false },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'accent', 'danger'] },
    variant: { control: 'inline-radio', options: ['solid', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const Plus = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <path d="M8 3v10M3 8h10" />
  </svg>
)

/** Every tone and variant, then each variant disabled. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(3,max-content)] items-center gap-3">
      {(['solid', 'outline', 'ghost'] as const).map((variant) => (
        <div key={variant} className="contents">
          <span className="text-caption text-neutral-subtle">{variant}</span>
          {(['default', 'accent', 'danger'] as const).map((tone) => (
            <Button key={tone} {...args} variant={variant} tone={tone}>
              {tone}
            </Button>
          ))}
        </div>
      ))}
      <span className="text-caption text-neutral-subtle">disabled</span>
      {(['solid', 'outline', 'ghost'] as const).map((variant) => (
        <Button key={variant} {...args} variant={variant} disabled>
          {variant}
        </Button>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <Button key={size} {...args} size={size}>
          <Plus />
          Size {size}
        </Button>
      ))}
    </div>
  ),
}

/** `asChild` renders a link with the button styles. */
export const AsLink: Story = {
  render: (args) => (
    <Button {...args} asChild>
      <a href="#docs">Read the docs</a>
    </Button>
  ),
}
