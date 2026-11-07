import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Button } from '../button'
import { Tooltip, TooltipContent, TooltipPanel, TooltipProvider, TooltipTrigger } from './tooltip'

const ShieldIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M8 2 3 4v4c0 3 2 5 5 6 3-1 5-3 5-6V4L8 2Z" />
    <path d="m6 8 1.5 1.5L10 7" />
  </svg>
)

/** A key chip for the trailing slot. */
const Kbd = ({ children }: { children: ReactNode }) => (
  <span className="rounded-sm bg-neutral-emphasized px-1 text-caption text-neutral-on-emphasized">{children}</span>
)

// The slot controls pick ready-made content; Storybook swaps the option for the element before render.
const leadingSlots = { none: null, icon: <ShieldIcon /> }
const trailingSlots = { none: null, shortcut: <Kbd>⌘K</Kbd>, icon: <ShieldIcon /> }

const meta = {
  title: 'Components/Tooltip',
  component: TooltipContent,
  args: {
    label: 'Save changes',
    side: 'top',
    arrow: true,
    leadingSlot: 'icon',
    trailingSlot: 'shortcut',
  },
  argTypes: {
    label: { control: 'text' },
    side: { control: 'inline-radio', options: ['top', 'bottom', 'left', 'right'] },
    arrow: { control: 'boolean' },
    leadingSlot: { control: 'select', options: Object.keys(leadingSlots), mapping: leadingSlots },
    trailingSlot: { control: 'select', options: Object.keys(trailingSlots), mapping: trailingSlots },
  },
  decorators: [
    (Story) => (
      <TooltipProvider>
        <Story />
      </TooltipProvider>
    ),
  ],
} satisfies Meta<typeof TooltipContent>

export default meta
type Story = StoryObj<typeof meta>

const Stage = ({ children }: { children: ReactNode }) => <div className="p-16">{children}</div>

/** Open in the canvas; in Docs it opens on hover or focus, so the bubble does not cover the page. */
export const Playground: Story = {
  render: (args, { viewMode }) => (
    <Stage>
      <Tooltip defaultOpen={viewMode !== 'docs'}>
        <TooltipTrigger asChild>
          <Button>Save</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </Stage>
  ),
}

/** The bubble on each side, drawn in the page. It is always in the opposite mode of the toolbar's. */
export const Sides: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(4,max-content)] items-center gap-x-8 gap-y-4">
      <span />
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <span key={side} className="text-caption text-neutral-subtle">
          {side}
        </span>
      ))}
      <span className="text-caption text-neutral-subtle">side</span>
      {(['top', 'bottom', 'left', 'right'] as const).map((side) => (
        <div key={side} className="p-2">
          <TooltipPanel {...args} side={side} />
        </div>
      ))}
    </div>
  ),
}

/** The slots and the arrow on and off. */
export const States: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_max-content] items-center gap-x-8 gap-y-4">
      <span className="text-caption text-neutral-subtle">both slots</span>
      <div className="p-2">
        <TooltipPanel {...args} leadingSlot={<ShieldIcon />} trailingSlot={<Kbd>⌘K</Kbd>} />
      </div>
      <span className="text-caption text-neutral-subtle">text only</span>
      <div className="p-2">
        <TooltipPanel {...args} leadingSlot={null} trailingSlot={null} />
      </div>
      <span className="text-caption text-neutral-subtle">no arrow</span>
      <div className="p-2">
        <TooltipPanel {...args} arrow={false} />
      </div>
      <span className="text-caption text-neutral-subtle">long label</span>
      <div className="p-2">
        <TooltipPanel {...args} label="Attach files from your computer, a drive or a link" />
      </div>
    </div>
  ),
}

/** A text-only hint on a button. */
export const WithLabel: Story = {
  args: { label: 'Attach files', leadingSlot: null, trailingSlot: null },
  render: (args) => (
    <Stage>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Attach</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </Stage>
  ),
}

/** A key chip in the trailing slot names the shortcut of the action. */
export const WithShortcut: Story = {
  args: { label: 'Save changes', leadingSlot: null, trailingSlot: <Kbd>⌘K</Kbd> },
  render: (args) => (
    <Stage>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Save</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </Stage>
  ),
}

/** An icon in the leading slot. */
export const WithIcon: Story = {
  args: { label: 'Manual approval', leadingSlot: <ShieldIcon />, trailingSlot: null },
  render: (args) => (
    <Stage>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Approval</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </Stage>
  ),
}

/** Opens below the trigger, for a trigger at the top of the screen. */
export const Bottom: Story = {
  args: { label: 'Open the menu', side: 'bottom', leadingSlot: null, trailingSlot: null },
  render: (args) => (
    <Stage>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button>Menu</Button>
        </TooltipTrigger>
        <TooltipContent {...args} />
      </Tooltip>
    </Stage>
  ),
}
