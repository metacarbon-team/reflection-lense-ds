import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock, CodeLine } from '../code-block'
import { CollapsibleContent } from '../collapsible'
import { Item } from '../item'
import { ChevronDownIcon } from '../../lib/icons'
import { Specimen } from '../../docs/specimen'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { TimelineStep, TimelineStepContent, TimelineStepTrigger } from './timeline-step'

const StepIcon = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
  </svg>
)

const codeLines = [
  'export async function retry(fn, opts) {',
  '  for (let i = 0; i < opts.attempts; i++) {',
  '    try { return await fn() }',
  '    catch { await sleep(delay(i)) }',
  '  }',
  '}',
]

/** The terminal output of a step: a Code Block labelled `tsx`, as in Figma. */
const CodeSample = () => (
  <CodeBlock
    title="tsx"
    leadingSlot={null}
    content={codeLines.map((code, index) => (
      <CodeLine key={code} number={index + 1} code={code} />
    ))}
  />
)

const TextRows = () => <Item label="Edited app/layout.tsx" />

const slotIcons = { none: undefined, circle: <StepIcon /> }

const meta = {
  title: 'Components/Timeline Step',
  component: TimelineStepTrigger,
  // The Docs table lists the root too, which owns `open`, `defaultOpen` and `onOpenChange`.
  subcomponents: { TimelineStep, TimelineStepContent },
  args: { children: 'Updated the page metadata', leadingSlot: 'circle', disabled: false },
  argTypes: {
    leadingSlot: { control: 'inline-radio', options: ['none', 'circle'], mapping: slotIcons },
  },
  parameters: { docs: { page: DocsPage } },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimelineStepTrigger>

export default meta
type Story = StoryObj<typeof meta>

/** One step. Click the header, or focus it and press Enter or Space, to show the details. */
export const Playground: Story = {
  render: (args) => (
    <TimelineStep defaultOpen>
      <TimelineStepTrigger {...args} />
      <TimelineStepContent>
        <TextRows />
      </TimelineStepContent>
    </TimelineStep>
  ),
}

/** Closed and open, with text rows and with a code block, as in the Figma matrix, where it is the `open` property: `false` and `true`. In code the step opens with `open` or `defaultOpen` on `TimelineStep`. */
export const Variants: Story = {
  decorators: [],
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(2,20rem)] items-start gap-x-8 gap-y-6">
      <span />
      {['closed', 'open'].map((state) => (
        <span key={state} className="text-caption text-neutral-subtle">
          {state}
        </span>
      ))}
      {[
        { name: 'text', content: <TextRows /> },
        { name: 'code', content: <CodeSample /> },
      ].map(({ name, content }) => (
        <div key={name} className="contents">
          <span className="text-caption text-neutral-subtle">{name}</span>
          <TimelineStep>
            <TimelineStepTrigger leadingSlot={<StepIcon />}>Collapsible</TimelineStepTrigger>
          </TimelineStep>
          <TimelineStep open>
            <TimelineStepTrigger leadingSlot={<StepIcon />}>Collapsible</TimelineStepTrigger>
            <TimelineStepContent>{content}</TimelineStepContent>
          </TimelineStep>
        </div>
      ))}
    </div>
  ),
}

/** A finished run: steps in a vertical flex with a 4 px gap. Each step keeps its own state. */
export const StackingSteps: Story = {
  name: 'Stacking steps',
  render: () => (
    <div className="flex flex-col gap-1">
      <TimelineStep>
        <TimelineStepTrigger leadingSlot={<StepIcon />}>Found the project files</TimelineStepTrigger>
      </TimelineStep>
      <TimelineStep defaultOpen>
        <TimelineStepTrigger leadingSlot={<StepIcon />}>Updated the page metadata</TimelineStepTrigger>
        <TimelineStepContent>
          <Item label="Edited app/layout.tsx" />
          <Item label="Edited app/page.tsx" />
        </TimelineStepContent>
      </TimelineStep>
      <TimelineStep defaultOpen>
        <TimelineStepTrigger leadingSlot={<StepIcon />}>Ran pnpm build</TimelineStepTrigger>
        <TimelineStepContent>
          <CodeSample />
        </TimelineStepContent>
      </TimelineStep>
    </div>
  ),
}

/** A step without a leading slot: the label starts at the edge. */
export const LabelOnly: Story = {
  args: { leadingSlot: undefined },
  render: (args) => (
    <TimelineStep defaultOpen>
      <TimelineStepTrigger {...args} />
      <TimelineStepContent>
        <TextRows />
      </TimelineStepContent>
    </TimelineStep>
  ),
}

/** A disabled header ignores clicks and is skipped by Tab. The step keeps its state. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <TimelineStep>
      <TimelineStepTrigger {...args} />
    </TimelineStep>
  ),
}

/**
 * **Keep the divider beside the content.**
 * The vertical divider ties the details to their header. Without it the content reads as a separate
 * block and loses its parent.
 */
export const GuidelineKeepTheDividerBesideTheContentDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-80">
        <TimelineStep open>
          <TimelineStepTrigger leadingSlot={<StepIcon />}>Collapsible</TimelineStepTrigger>
          <TimelineStepContent>
            <TextRows />
            <Item label="Edited app/page.tsx" />
          </TimelineStepContent>
        </TimelineStep>
      </div>
    </Specimen>
  ),
}

export const GuidelineKeepTheDividerBesideTheContentDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-80">
        <TimelineStep open>
          <TimelineStepTrigger leadingSlot={<StepIcon />}>Collapsible</TimelineStepTrigger>
          {/* The same panel without the divider: the details no longer point at their header. */}
          <CollapsibleContent className="pl-5.25">
            <TextRows />
            <Item label="Edited app/page.tsx" />
          </CollapsibleContent>
        </TimelineStep>
      </div>
    </Specimen>
  ),
}

/**
 * **Match the chevron to the state.**
 * Use closed (chevron down) for a collapsed step and open (chevron up) for an expanded one. A chevron
 * that stays down over visible content hides the state.
 */
export const GuidelineMatchTheChevronToTheStateDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-80">
        <TimelineStep open>
          <TimelineStepTrigger leadingSlot={<StepIcon />}>Collapsible</TimelineStepTrigger>
          <TimelineStepContent>
            <TextRows />
          </TimelineStepContent>
        </TimelineStep>
      </div>
    </Specimen>
  ),
}

export const GuidelineMatchTheChevronToTheStateDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="flex w-80 flex-col gap-1">
        {/* An open step whose chevron stays down: a static copy of the header, since the real one flips by itself. */}
        <span className="inline-flex items-center gap-1 py-0.5 text-body-xsmall-medium text-neutral">
          <span className="flex shrink-0 items-center justify-center [&_svg:not([class*=size-])]:size-4">
            <StepIcon />
          </span>
          Collapsible
          <ChevronDownIcon className="size-4 shrink-0" />
        </span>
        <div className="flex gap-3 pl-2">
          <span aria-hidden="true" className="w-px shrink-0 self-stretch border-l border-neutral-subtle" />
          <div className="min-w-0 flex-1">
            <TextRows />
          </div>
        </div>
      </div>
    </Specimen>
  ),
}

const steps = ['Found the project files', 'Updated the page metadata', 'Ran pnpm lint']

/**
 * **Keep a 4 px gap between steps.**
 * A tight gap reads as one sequence. Larger gaps split the steps into unrelated rows and the dividers
 * stop pointing to a shared timeline.
 */
export const GuidelineKeepA4PxGapBetweenStepsDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="flex w-80 flex-col gap-1">
        {steps.map((step) => (
          <TimelineStep key={step}>
            <TimelineStepTrigger leadingSlot={<StepIcon />}>{step}</TimelineStepTrigger>
          </TimelineStep>
        ))}
      </div>
    </Specimen>
  ),
}

export const GuidelineKeepA4PxGapBetweenStepsDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="flex w-80 flex-col gap-6">
        {steps.map((step) => (
          <TimelineStep key={step}>
            <TimelineStepTrigger leadingSlot={<StepIcon />}>{step}</TimelineStepTrigger>
          </TimelineStep>
        ))}
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  const rules = [
    [GuidelineKeepTheDividerBesideTheContentDo, GuidelineKeepTheDividerBesideTheContentDont],
    [GuidelineMatchTheChevronToTheStateDo, GuidelineMatchTheChevronToTheStateDont],
    [GuidelineKeepA4PxGapBetweenStepsDo, GuidelineKeepA4PxGapBetweenStepsDont],
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
