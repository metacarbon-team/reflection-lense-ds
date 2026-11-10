import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tag } from './tag'

const TONES = ['default', 'success', 'warning', 'danger', 'info'] as const
const SIZES = ['sm', 'md', 'lg'] as const

const Clock = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
    <path d="M8 4.5V8l2 1.5" />
  </svg>
)

const Close = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
)

const meta = {
  title: 'Components/Tag',
  component: Tag,
  args: { children: 'Label', tone: 'default', size: 'sm', leadingSlot: false, trailingSlot: false },
  argTypes: {
    tone: { control: 'select', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    children: { control: 'text' },
    // The slots take any node; here a boolean switches a sample icon on and off.
    leadingSlot: { control: 'boolean', mapping: { true: <Clock /> } },
    trailingSlot: { control: 'boolean', mapping: { true: <Close /> } },
  },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every tone at every size. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(5,max-content)] items-center gap-x-6 gap-y-3">
      <span />
      {TONES.map((tone) => (
        <span key={tone} className="text-caption text-neutral-subtle">
          {tone}
        </span>
      ))}
      {SIZES.map((size) => (
        <div key={size} className="contents">
          <span className="text-caption text-neutral-subtle">{size}</span>
          {TONES.map((tone) => (
            <Tag key={tone} {...args} tone={tone} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Both slots at every size. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {SIZES.map((size) => (
        <Tag key={size} {...args} size={size} tone="info" leadingSlot={<Clock />} trailingSlot={<Close />}>
          Size {size}
        </Tag>
      ))}
    </div>
  ),
}

/** The status carries the meaning; the label says it in words. */
export const Status: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Tag {...args} tone="success">
        Active
      </Tag>
      <Tag {...args} tone="warning">
        Pending
      </Tag>
      <Tag {...args} tone="danger">
        Failed
      </Tag>
    </div>
  ),
}

/** Plain labels for categories, no dot. */
export const Categories: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Tag {...args} size="md">
        Design
      </Tag>
      <Tag {...args} size="md">
        Research
      </Tag>
    </div>
  ),
}

/** A leading icon for the kind of thing, a trailing close icon to remove it. */
export const WithSlots: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <Tag {...args} size="md" leadingSlot={<Clock />}>
        Label
      </Tag>
      <Tag {...args} size="md" trailingSlot={<Close />}>
        Label
      </Tag>
      <Tag {...args} size="md" leadingSlot={<Clock />} trailingSlot={<Close />}>
        Label
      </Tag>
    </div>
  ),
}
