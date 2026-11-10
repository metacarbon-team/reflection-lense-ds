import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './avatar'

const KINDS = ['initials', 'icon', 'image'] as const
const TONES = ['accent', 'default', 'inverse'] as const
const SIZES = ['sm', 'md', 'lg'] as const

// A plain placeholder portrait, so the stories need no network.
const PHOTO = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="#d9d7d1"/><circle cx="20" cy="16" r="7" fill="#555755"/><path d="M6 40c0-8 6-13 14-13s14 5 14 13z" fill="#303230"/></svg>',
)}`

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { kind: 'initials', tone: 'accent', size: 'sm', initials: 'AG', src: PHOTO, alt: 'Alex Grey' },
  argTypes: {
    kind: { control: 'inline-radio', options: KINDS },
    tone: { control: 'inline-radio', options: TONES },
    size: { control: 'inline-radio', options: SIZES },
    initials: { control: 'text' },
  },
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every kind, tone and size: all 27 combinations. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(3,max-content)] items-center gap-x-6 gap-y-3">
      {KINDS.flatMap((kind) =>
        SIZES.map((size) => (
          <div key={`${kind}-${size}`} className="contents">
            <span className="text-caption text-neutral-subtle">
              {kind} {size}
            </span>
            {TONES.map((tone) => (
              <Avatar key={tone} {...args} kind={kind} tone={tone} size={size} />
            ))}
          </div>
        )),
      )}
    </div>
  ),
}

/** Named by a visible name, so the avatar itself stays silent for screen readers. */
export const WithLabel: Story = {
  args: { size: 'lg', tone: 'inverse', initials: 'AG' },
  render: (args) => (
    <div className="flex items-center gap-3">
      <Avatar {...args} />
      <div>
        <div className="text-label">Alex Grey</div>
        <div className="text-caption text-neutral-subtle">Design system agent</div>
      </div>
    </div>
  ),
}

/** A photo that fails to load falls back to the initials; without initials, to the profile icon. */
export const ImageFallback: Story = {
  args: { kind: 'image', size: 'lg', src: 'broken.png', initials: 'AG' },
  render: (args) => (
    <div className="flex items-center gap-4">
      <Avatar {...args} src={PHOTO} />
      <Avatar {...args} />
      <Avatar {...args} initials={undefined} />
    </div>
  ),
}
