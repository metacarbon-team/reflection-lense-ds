import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DiffStat, diffStatVariants } from './diff-stat'
import { Specimen } from '../../docs/specimen'
import { GuidelinePairs } from '../../docs/guideline-pairs'

const meta = {
  title: 'Components/Diff Stat',
  component: DiffStat,
  args: { added: 42, removed: 8, showAdded: true, showRemoved: true },
  parameters: { docs: { page: DocsPage } },
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

/** Next to a file name in a list of changes. Each count is named for screen readers with `role` and `aria-label`. */
export const WithFile: Story = {
  render: () => (
    <ul className="flex w-72 flex-col gap-2">
      {[
        { name: 'button.tsx', added: 120, removed: 34 },
        { name: 'theme.css', added: 3, removed: 17 },
      ].map((file) => (
        <li key={file.name} className="flex items-center justify-between gap-4">
          <span className="text-body-small">{file.name}</span>
          <DiffStat
            added={file.added}
            removed={file.removed}
            role="group"
            aria-label={`${file.added} lines added, ${file.removed} lines removed`}
          />
        </li>
      ))}
    </ul>
  ),
}

/** A new file only adds lines. */
export const OnlyAdded: Story = {
  args: { added: 86, showRemoved: false },
}

/** A deleted file only removes lines. */
export const OnlyRemoved: Story = {
  args: { removed: 212, showAdded: false },
}

/** The full count with a thousands separator: rounded values hide how big the change really is. */
export const ExactNumbers: Story = {
  args: { added: 1204, removed: 87 },
}

/**
 * The Don't examples show a mistake that the component cannot make: it always writes the sign, shows
 * the exact number and keeps its colors. So they are plain copies of its markup, written wrong on purpose.
 */
function WrongStat({ added, removed, swapped }: { added: string; removed: string; swapped?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-caption tabular-nums">
      <span className={diffStatVariants({ kind: swapped ? 'removed' : 'added' })}>{added}</span>
      <span className={diffStatVariants({ kind: swapped ? 'added' : 'removed' })}>{removed}</span>
    </span>
  )
}

/**
 * **Always show the sign**  
 * Numbers start with + or −, so the meaning never depends on color alone.
 */
export const GuidelineAlwaysShowTheSignDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <DiffStat added={120} removed={34} />
    </Specimen>
  ),
}

export const GuidelineAlwaysShowTheSignDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <WrongStat added="120" removed="34" />
    </Specimen>
  ),
}

/**
 * **Show exact numbers**  
 * Write the full count. Rounded values hide how big the change really is, and a reviewer needs the exact size.
 */
export const GuidelineShowExactNumbersDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <DiffStat added={1204} removed={87} />
    </Specimen>
  ),
}

export const GuidelineShowExactNumbersDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <WrongStat added="+1k" removed="−0.1k" />
    </Specimen>
  ),
}

/**
 * **Green for added, red for removed**  
 * Keep the colors the same everywhere. Swapped colors make a deletion look like a good thing.
 */
export const GuidelineGreenForAddedRedForRemovedDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <DiffStat added={42} removed={8} />
    </Specimen>
  ),
}

export const GuidelineGreenForAddedRedForRemovedDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <WrongStat added="+42" removed="−8" swapped />
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then one Guidelines heading with a title, a subtitle and a panel per rule. */
function DocsPage() {
  const rules = [
    [GuidelineAlwaysShowTheSignDo, GuidelineAlwaysShowTheSignDont],
    [GuidelineShowExactNumbersDo, GuidelineShowExactNumbersDont],
    [GuidelineGreenForAddedRedForRemovedDo, GuidelineGreenForAddedRedForRemovedDont],
  ] as const
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <GuidelinePairs rules={rules} />
    </>
  )
}
