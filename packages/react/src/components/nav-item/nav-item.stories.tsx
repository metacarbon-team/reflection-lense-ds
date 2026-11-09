import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { NavItem } from './nav-item'

const svgProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const CircleIcon = () => (
  <svg {...svgProps}>
    <circle cx="8" cy="8" r="5.25" />
  </svg>
)

const HomeIcon = () => (
  <svg {...svgProps}>
    <path d="M3 7l5-4 5 4v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7Z" />
    <path d="M6.5 14V9.5h3V14" />
  </svg>
)

const InboxIcon = () => (
  <svg {...svgProps}>
    <path d="M2.5 9.5l1.7-5.2A1 1 0 0 1 5.150 3.600h5.700a1 1 0 0 1 .95.700l1.700 5.200v3a1 1 0 0 1-1 1h-9.300a1 1 0 0 1-1-1v-3Z" />
    <path d="M2.500 9.500h3.200l.8 1.500h3l.8-1.500h3.200" />
  </svg>
)

const FolderIcon = () => (
  <svg {...svgProps}>
    <path d="M2 4.500A1.500 1.500 0 0 1 3.500 3h2.800l1.400 1.700h4.800A1.500 1.500 0 0 1 14 6.200v5.300a1.500 1.500 0 0 1-1.500 1.500h-9A1.500 1.500 0 0 1 2 11.500v-7Z" />
  </svg>
)

// The slot controls pick ready-made content; Storybook swaps the option for the element before render.
const leadingSlots = { none: null, icon: <CircleIcon />, home: <HomeIcon /> }
const trailingSlots = { none: null, icon: <CircleIcon /> }

const meta = {
  title: 'Components/Nav Item',
  component: NavItem,
  args: {
    label: 'Label',
    level: 'root',
    state: 'default',
    active: false,
    disabled: false,
    chevron: false,
    expanded: false,
    leadingSlot: 'icon',
    trailingSlot: 'none',
  },
  argTypes: {
    label: { control: 'text' },
    level: { control: 'inline-radio', options: ['root', 'nested'] },
    state: { control: 'select', options: ['default', 'hover', 'active', 'focus'] },
    active: { control: 'boolean' },
    disabled: { control: 'boolean' },
    chevron: { control: 'boolean' },
    expanded: { control: 'boolean' },
    leadingSlot: { control: 'select', options: Object.keys(leadingSlots), mapping: leadingSlots },
    trailingSlot: { control: 'select', options: Object.keys(trailingSlots), mapping: trailingSlots },
  },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavItem>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const states = ['default', 'hover', 'active', 'focus', 'disabled'] as const

const columns: { name: string; props: Partial<ComponentProps<typeof NavItem>> }[] = [
  { name: 'root', props: { level: 'root' } },
  { name: 'nested', props: { level: 'nested' } },
  { name: 'group, closed', props: { level: 'root', chevron: true } },
  { name: 'group, expanded', props: { level: 'root', chevron: true, expanded: true } },
]

/**
 * Both levels in every state, and a root group row closed and expanded. Hover and focus are frozen
 * with `state`; the disabled row uses `disabled`.
 */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(4,15rem)] items-center gap-x-3 gap-y-2">
      <span />
      {columns.map(({ name }) => (
        <span key={name} className="text-caption text-neutral-subtle">
          {name}
        </span>
      ))}
      {states.map((state) => (
        <div key={state} className="contents">
          <span className="text-caption text-neutral-subtle">{state}</span>
          {columns.map(({ name, props }) => (
            <NavItem
              key={name}
              {...args}
              active={false}
              disabled={state === 'disabled'}
              leadingSlot={leadingSlots.icon}
              trailingSlot={null}
              state={state === 'disabled' ? 'default' : state}
              {...props}
            />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** Only the label. Everything else is hidden when it is not set. */
export const LabelOnly: Story = {
  args: { leadingSlot: 'none' },
}

/** An expanded group row with its children. `expanded` turns the chevron down and sets `aria-expanded`; the children are nested. */
export const Group: Story = {
  render: () => (
    <nav aria-label="Sidebar" className="flex flex-col gap-0.5">
      <NavItem label="Home" leadingSlot={<HomeIcon />} chevron expanded />
      <NavItem label="Inbox" level="nested" leadingSlot={<InboxIcon />} />
      <NavItem label="Projects" level="nested" leadingSlot={<FolderIcon />} />
    </nav>
  ),
}

/** Mark one row only: the page the user is on. */
export const Active: Story = {
  render: () => (
    <nav aria-label="Sidebar" className="flex flex-col gap-0.5">
      <NavItem label="Home" leadingSlot={<HomeIcon />} />
      <NavItem label="Inbox" leadingSlot={<InboxIcon />} active />
      <NavItem label="Projects" leadingSlot={<FolderIcon />} />
    </nav>
  ),
}

/** A disabled row dims its label and ignores the pointer. */
export const Disabled: Story = {
  render: () => (
    <nav aria-label="Sidebar" className="flex flex-col gap-0.5">
      <NavItem label="Home" leadingSlot={<HomeIcon />} />
      <NavItem label="Archive" leadingSlot={<FolderIcon />} disabled />
    </nav>
  ),
}

/** A long label is cut with an ellipsis. */
export const LongLabel: Story = {
  args: { label: 'A label that is much too long to fit in one line of the row' },
}

/**
 * `asChild` renders a link with the row's styles. A disabled link cannot keep its `href`, so it
 * becomes a `span` with the link role, marked `aria-disabled` and `data-disabled`.
 */
export const AsLink: Story = {
  render: () => (
    <div className="flex flex-col gap-1">
      <NavItem asChild label="Read the docs" leadingSlot={<HomeIcon />}>
        <a href="#docs" />
      </NavItem>
      <NavItem asChild disabled label="Read the docs" leadingSlot={<HomeIcon />}>
        <a href="#docs" />
      </NavItem>
    </div>
  ),
}
