import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './collapsible'
import { ChevronDownIcon } from '../../lib/icons'
import { Specimen } from '../../docs/specimen'
import { GuidelinePairs } from '../../docs/guideline-pairs'

const ToolsIcon = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 4h7M12 4h2M2 12h2M7 12h7M10 2v4M5 10v4" />
  </svg>
)

const states = ['default', 'hover', 'open', 'disabled'] as const

const slotIcons = { none: undefined, tools: <ToolsIcon /> }

const meta = {
  title: 'Components/Collapsible',
  component: CollapsibleTrigger,
  args: { children: 'Collapsible', state: 'default', leadingSlot: 'tools', disabled: false },
  argTypes: {
    state: { control: 'inline-radio', options: ['default', 'hover'] },
    leadingSlot: { control: 'inline-radio', options: ['none', 'tools'], mapping: slotIcons },
  },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof CollapsibleTrigger>

export default meta
type Story = StoryObj<typeof meta>

/** One trigger with its panel. Click it, or focus it and press Enter or Space. */
export const Playground: Story = {
  render: (args) => (
    <Collapsible className="flex w-64 flex-col gap-2">
      <CollapsibleTrigger {...args} />
      <CollapsibleContent className="text-body-small text-neutral-subtle">
        The panel holds any content. It leaves the layout when closed.
      </CollapsibleContent>
    </Collapsible>
  ),
}

/** Every state with and without the leading slot, as in the Figma matrix. Open is `aria-expanded`, not a prop. */
export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(4,max-content)] items-center gap-x-8 gap-y-3">
      <span />
      {states.map((state) => (
        <span key={state} className="text-caption text-neutral-subtle">
          {state}
        </span>
      ))}
      {[
        { name: 'with leading slot', leadingSlot: <ToolsIcon /> },
        { name: 'label only', leadingSlot: undefined },
      ].map(({ name, leadingSlot }) => (
        <div key={name} className="contents">
          <span className="text-caption text-neutral-subtle">{name}</span>
          {states.map((state) => (
            <Collapsible key={state} open={state === 'open'}>
              <CollapsibleTrigger
                state={state === 'hover' ? 'hover' : 'default'}
                leadingSlot={leadingSlot}
                disabled={state === 'disabled'}
              >
                Collapsible
              </CollapsibleTrigger>
              {/* An open trigger points at its panel with `aria-controls`, so the open cells keep one, hidden from view. */}
              {state === 'open' && <CollapsibleContent className="sr-only">Panel</CollapsibleContent>}
            </Collapsible>
          ))}
        </div>
      ))}
    </div>
  ),
}

/** The usual use: a trigger over a panel. The chevron flips when the panel opens. */
export const WithPanel: Story = {
  render: (args) => (
    <Collapsible className="flex w-72 flex-col gap-2">
      <CollapsibleTrigger {...args} leadingSlot={<ToolsIcon />}>
        Plan: migrate to Base UI
      </CollapsibleTrigger>
      <CollapsibleContent className="text-body-small text-neutral-subtle">
        Replace the Radix primitives one component at a time and keep the public props the same.
      </CollapsibleContent>
    </Collapsible>
  ),
}

/** Controlled: the parent owns the open state through `open` and `onOpenChange`. */
export const Controlled: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="flex w-72 flex-col gap-2">
        <CollapsibleTrigger {...args}>{open ? 'Hide details' : 'Show details'}</CollapsibleTrigger>
        <CollapsibleContent className="text-body-small text-neutral-subtle">Details of the change.</CollapsibleContent>
      </Collapsible>
    )
  },
}

/** A disabled trigger ignores clicks, is skipped by Tab and keeps the panel as it is. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <Collapsible>
      <CollapsibleTrigger {...args} />
    </Collapsible>
  ),
}

/**
 * **Always show the chevron.**
 * Without it the trigger reads as plain text. Every trigger keeps its chevron.
 */
export const GuidelineAlwaysShowTheChevronDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Collapsible>
        <CollapsibleTrigger>Advanced</CollapsibleTrigger>
      </Collapsible>
    </Specimen>
  ),
}

export const GuidelineAlwaysShowTheChevronDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      {/* The same look without the chevron: the trigger turns into text that does not say it opens. */}
      <span className="inline-flex py-0.5 text-body-xsmall-medium text-neutral-subtle">Advanced</span>
    </Specimen>
  ),
}

/**
 * **Flip the chevron when the panel opens.**
 * A closed panel shows the chevron down, an open one shows it up. A chevron that stays down on an open
 * panel hides its state.
 */
export const GuidelineFlipTheChevronDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="flex items-center gap-8">
        <Collapsible>
          <CollapsibleTrigger>Advanced</CollapsibleTrigger>
        </Collapsible>
        <Collapsible open>
          <CollapsibleTrigger>Tools</CollapsibleTrigger>
          <CollapsibleContent className="sr-only">Panel</CollapsibleContent>
        </Collapsible>
      </div>
    </Specimen>
  ),
}

export const GuidelineFlipTheChevronDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="flex items-center gap-8">
        <Collapsible>
          <CollapsibleTrigger>Advanced</CollapsibleTrigger>
        </Collapsible>
        {/* The open trigger with a chevron that stays down: a plain button that only looks open. */}
        <span className="inline-flex items-center gap-1 py-0.5 text-body-xsmall-medium text-neutral">
          Tools
          <ChevronDownIcon className="size-4 shrink-0" />
        </span>
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  const rules = [
    [GuidelineAlwaysShowTheChevronDo, GuidelineAlwaysShowTheChevronDont],
    [GuidelineFlipTheChevronDo, GuidelineFlipTheChevronDont],
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
