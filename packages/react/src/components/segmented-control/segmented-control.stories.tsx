import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { CalendarIcon, FileIcon, UserIcon, CopyIcon } from '../../lib/icons'
import { Badge } from '../badge/badge'
import { SegmentedControl, SegmentedControlItem } from './segmented-control'

const meta = {
  title: 'Components/Segmented control',
  component: SegmentedControl,
  args: { defaultValue: 'overview', size: 'sm', 'aria-label': 'Report view' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'lg'] } },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

const labels = ['Overview', 'Analytics', 'Reports', 'Settings'] as const
const items = labels.map((label) => <SegmentedControlItem key={label} value={label.toLowerCase()} label={label} />)

/** One value from a few: the selected segment is raised on the track. */
export const Playground: Story = {
  render: (args) => <SegmentedControl {...args}>{items}</SegmentedControl>,
}

/** `lg`: 36px segments with label text. */
export const Large: Story = {
  args: { size: 'lg' },
  render: (args) => <SegmentedControl {...args}>{items}</SegmentedControl>,
}

/** Icon-only segments: the icon goes in `leadingSlot`, and `aria-label` names each segment. */
export const IconOnly: Story = {
  args: { defaultValue: 'day', 'aria-label': 'Range' },
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="day" aria-label="Day" leadingSlot={<CalendarIcon />} />
      <SegmentedControlItem value="files" aria-label="Files" leadingSlot={<FileIcon />} />
      <SegmentedControlItem value="people" aria-label="People" leadingSlot={<UserIcon />} />
      <SegmentedControlItem value="copies" aria-label="Copies" leadingSlot={<CopyIcon />} />
    </SegmentedControl>
  ),
}

/** Slots around the label: an icon before it, a counter after it. */
export const WithSlots: Story = {
  args: { defaultValue: 'files', 'aria-label': 'Content', size: 'lg' },
  render: (args) => (
    <SegmentedControl {...args}>
      <SegmentedControlItem value="files" label="Files" leadingSlot={<FileIcon />} />
      <SegmentedControlItem
        value="people"
        label="People"
        leadingSlot={<UserIcon />}
        trailingSlot={<Badge size="sm">12</Badge>}
      />
    </SegmentedControl>
  ),
}

const Controlled = () => {
  const [value, setValue] = useState('light')
  return (
    <div className="flex items-center gap-3">
      <SegmentedControl aria-label="Color mode" value={value} onValueChange={setValue}>
        <SegmentedControlItem value="light" label="Light" />
        <SegmentedControlItem value="dark" label="Dark" />
        <SegmentedControlItem value="system" label="System" disabled />
      </SegmentedControl>
      <span className="text-body-small text-neutral-subtle">{value}</span>
    </div>
  )
}

/** Controlled with `value` and `onValueChange`. Pressing the selected segment keeps it; a disabled one cannot be selected. */
export const WithValue: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Controlled />,
}

const Cell = ({ children }: { children: ReactNode }) => (
  <div className="flex h-18 items-center justify-center border border-dashed border-neutral-subtle px-6">
    {children}
  </div>
)
const Head = ({ children }: { children: ReactNode }) => (
  <span className="text-center text-label text-neutral">{children}</span>
)
const Side = ({ children }: { children: ReactNode }) => (
  <span className="pr-4 text-right text-caption text-neutral-subtle">{children}</span>
)

const states = ['default', 'hover', 'active', 'focus', 'disabled'] as const

/** Every state of a segment per size, as in the Figma matrix. Hover and focus are frozen with `state`. */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="grid grid-cols-[4rem_repeat(5,7rem)] items-center gap-y-2">
      <Side>state</Side>
      {states.map((state) => (
        <Head key={state}>{state}</Head>
      ))}
      {(['sm', 'lg'] as const).map((size) => (
        <Row key={size} size={size} />
      ))}
    </div>
  ),
}

function Row({ size }: { size: 'sm' | 'lg' }) {
  return (
    <>
      <Side>{size}</Side>
      {states.map((state) => (
        <Cell key={state}>
          <SegmentedControl
            aria-label={`${size}, ${state}`}
            size={size}
            defaultValue={state === 'active' ? 'tab' : undefined}
            className="bg-transparent p-0 after:hidden"
          >
            <SegmentedControlItem
              value="tab"
              label="Tab"
              state={state === 'hover' || state === 'focus' ? state : undefined}
              disabled={state === 'disabled'}
            />
          </SegmentedControl>
        </Cell>
      ))}
    </>
  )
}

// The mistake in a Don't is drawn by hand: the control keeps one segment selected, so the second
// "selected" look is the same classes the selected segment has, put on one that is not.
const fakeSelected = 'bg-neutral-subtle text-neutral shadow-sm after:border-neutral'

/**
 * **Mark exactly one segment as active**
 * The active segment shows the selected option. Two active segments make the state unclear.
 */
export const GuidelineOneActiveDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <SegmentedControl aria-label="Do, one active segment" defaultValue="overview">
        {items}
      </SegmentedControl>
    </Specimen>
  ),
}

export const GuidelineOneActiveDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <SegmentedControl aria-label="Don’t, two active segments" defaultValue="overview">
        {labels.map((label) => (
          <SegmentedControlItem
            key={label}
            value={label.toLowerCase()}
            label={label}
            className={label === 'Analytics' ? fakeSelected : undefined}
          />
        ))}
      </SegmentedControl>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <GuidelinePairs rules={[[GuidelineOneActiveDo, GuidelineOneActiveDont]]} />
    </>
  )
}
