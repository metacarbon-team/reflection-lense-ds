import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton, SkeletonItem } from './skeleton'

const SHAPES = ['text', 'description', 'block', 'circle'] as const

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { shape: 'text' },
  argTypes: {
    shape: { control: 'inline-radio', options: SHAPES },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** All four shapes in one tone. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_max-content] items-center gap-x-6 gap-y-4">
      {SHAPES.map((shape) => (
        <div key={shape} className="contents">
          <span className="text-caption text-neutral-subtle">{shape}</span>
          <Skeleton {...args} shape={shape} />
        </div>
      ))}
    </div>
  ),
}

/** The row: `leading` turns the square before the text on or off. */
export const Item: StoryObj<typeof SkeletonItem> = {
  args: { leading: true },
  render: (args) => (
    <div className="w-80">
      <SkeletonItem {...args} />
    </div>
  ),
}

/** The row with and without the leading square. */
export const ItemVariants: Story = {
  render: () => (
    <div className="inline-grid w-80 gap-2">
      <SkeletonItem />
      <SkeletonItem leading={false} />
    </div>
  ),
}

/** A list while it loads: the same row repeated, with room between rows. */
export const LoadingList: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
      <SkeletonItem />
    </div>
  ),
}

/** A card while it loads: an avatar shape, a title and a block for the picture. */
export const Card: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3 rounded-lg border border-neutral-subtle p-4">
      <div className="flex items-center gap-3">
        <Skeleton shape="circle" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="w-full" />
          <Skeleton shape="description" className="w-full" />
        </div>
      </div>
      <Skeleton shape="block" className="h-24 w-full" />
    </div>
  ),
}
