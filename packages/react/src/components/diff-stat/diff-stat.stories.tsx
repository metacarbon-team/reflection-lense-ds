import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiffStat } from './diff-stat'

const meta = {
  title: 'Components/Diff Stat',
  component: DiffStat,
  args: { added: '+42', removed: '−8', showAdded: true, showRemoved: true },
} satisfies Meta<typeof DiffStat>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every combination of `showAdded` and `showRemoved`; with both off nothing is shown. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[repeat(3,max-content)] items-center gap-x-6 gap-y-3">
      <span />
      <span className="text-caption text-neutral-subtle">showRemoved</span>
      <span className="text-caption text-neutral-subtle">no showRemoved</span>
      <span className="text-caption text-neutral-subtle">showAdded</span>
      <DiffStat {...args} showAdded showRemoved />
      <DiffStat {...args} showAdded showRemoved={false} />
      <span className="text-caption text-neutral-subtle">no showAdded</span>
      <DiffStat {...args} showAdded={false} showRemoved />
      <DiffStat {...args} showAdded={false} showRemoved={false} />
    </div>
  ),
}

/** Next to a file name in a list of changes. */
export const WithFile: Story = {
  render: () => (
    <ul className="flex w-72 flex-col gap-2">
      {[
        { name: 'button.tsx', added: '+120', removed: '−34' },
        { name: 'theme.css', added: '+3', removed: '−17' },
      ].map((file) => (
        <li key={file.name} className="flex items-center justify-between gap-4">
          <span className="text-body-small">{file.name}</span>
          <DiffStat added={file.added} removed={file.removed} />
        </li>
      ))}
    </ul>
  ),
}

/** A new file only adds lines. */
export const OnlyAdded: Story = {
  args: { added: '+86', showRemoved: false },
}

/** A deleted file only removes lines. */
export const OnlyRemoved: Story = {
  args: { removed: '−212', showAdded: false },
}

/** Write the full count: rounded values hide how big the change really is. */
export const ExactNumbers: Story = {
  args: { added: '+1,204', removed: '−87' },
}
