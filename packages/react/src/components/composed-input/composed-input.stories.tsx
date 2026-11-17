import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { ChevronDownIcon, PaperclipIcon, ShieldIcon } from '../../lib/icons'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { Button } from '../button'
import { Field } from '../field'
import { IconButton } from '../icon-button'
import { ComposedInput } from './composed-input'

const Attach = ({ divider = false }: { divider?: boolean }) => (
  <>
    <IconButton tone="default" variant="ghost" size="sm" aria-label="Attach file">
      <PaperclipIcon />
    </IconButton>
    {divider && <span aria-hidden="true" className="h-4 border-l border-neutral-subtle" />}
  </>
)

const Approval = () => (
  <Button tone="default" variant="ghost" size="sm" leadingSlot={<ShieldIcon />}>
    Manual
  </Button>
)

const Model = ({ label = 'Beam-501B-A23B' }: { label?: string }) => (
  <Button tone="default" variant="ghost" size="sm" trailingSlot={<ChevronDownIcon />}>
    {label}
  </Button>
)

// The slot controls pick ready-made content; Storybook swaps the option for the element before render.
const leadingSlots = {
  none: null,
  attach: <Attach />,
  'attach and mode': (
    <>
      <Attach divider />
      <Approval />
    </>
  ),
}
const trailingSlots = { none: null, model: <Model /> }

const meta = {
  title: 'Components/Composed Input',
  component: ComposedInput,
  args: {
    'aria-label': 'Message',
    placeholder: 'Describe a task, paste an issue link, or @ a file',
    layout: 'default',
    disabled: false,
    leadingToolbarSlot: 'attach and mode' as unknown as ReactNode,
    trailingToolbarSlot: 'model' as unknown as ReactNode,
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['default', 'compact'] },
    leadingToolbarSlot: { control: 'select', options: Object.keys(leadingSlots), mapping: leadingSlots },
    trailingToolbarSlot: { control: 'select', options: Object.keys(trailingSlots), mapping: trailingSlots },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-160">
        <Story />
      </div>
    ),
  ],
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof ComposedInput>

export default meta
type Story = StoryObj<typeof meta>

/** Type and press Enter or the send button. Shift+Enter adds a new line. */
export const Playground: Story = {}

type Look = 'default' | 'hover' | 'focus' | 'filled' | 'disabled'
const layouts = ['default', 'compact'] as const
const looks: Look[] = ['default', 'hover', 'focus', 'filled', 'disabled']

// Hover and focus are frozen with the classes the component applies on the real states, so the grid shows
// what a user sees without a `state` prop.
const frozen: Record<Look, string | undefined> = {
  default: undefined,
  hover: 'border-neutral',
  focus: 'border-neutral-emphasized shadow-focus-ring',
  filled: undefined,
  disabled: undefined,
}

/** Both layouts in every state, as in the Figma matrix. Hover and focus are frozen with classes; the disabled column uses `disabled`. */
export const Variants: Story = {
  decorators: [],
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(5,32rem)] items-center gap-x-6 gap-y-4">
      <span />
      {looks.map((look) => (
        <span key={look} className="text-caption text-neutral-subtle">
          {look}
        </span>
      ))}
      {layouts.map((layout) => (
        <div key={layout} className="contents">
          <span className="text-caption text-neutral-subtle">{layout}</span>
          {looks.map((look) => (
            <ComposedInput
              key={look}
              {...args}
              layout={layout}
              aria-label={`${layout}, ${look}`}
              disabled={args.disabled || look === 'disabled'}
              defaultValue={look === 'filled' ? 'Go ahead and batch writes to 16 ms' : undefined}
              className={frozen[look]}
              leadingToolbarSlot={layout === 'default' ? leadingSlots['attach and mode'] : leadingSlots.attach}
              trailingToolbarSlot={layout === 'default' ? <Model /> : <Model label="User" />}
            />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** `compact` is one row. The text area grows with the text, up to 120 px. */
export const Compact: Story = {
  args: { layout: 'compact', placeholder: 'Reply…', leadingToolbarSlot: leadingSlots.attach },
}

/** Without slots only the text area and the send button remain. */
export const WithoutSlots: Story = {
  args: { leadingToolbarSlot: null, trailingToolbarSlot: null },
}

/** A disabled composer blocks typing and sending, and disables the controls in its slots. */
export const Disabled: Story = {
  args: { disabled: true },
}

/** Sending: the handler gets the trimmed text. Clear the field yourself after sending. */
export const Sending: Story = {
  render: function Render(args) {
    const [value, setValue] = useState('')
    const [sent, setSent] = useState<string[]>([])
    return (
      <div className="flex flex-col gap-3">
        <ul aria-label="Sent messages" className="flex flex-col gap-1 text-body-small text-neutral-subtle">
          {sent.map((message, index) => (
            <li key={index}>{message}</li>
          ))}
        </ul>
        <ComposedInput
          {...args}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onSubmit={(text) => {
            setSent((list) => [...list, text])
            setValue('')
          }}
        />
      </div>
    )
  },
}

/** In a Field the label names the text area, the error marks it invalid and wires `aria-describedby`. */
export const InField: Story = {
  render: (args) => (
    <Field label="Message" error="Describe the task before sending.">
      <ComposedInput {...args} aria-label={undefined} />
    </Field>
  ),
}

/**
 * **Use compact for single-line input.**  
 * Compact fits short prompts without extra controls. When the toolbar is empty, the default layout only
 * adds an empty band under the text.
 */
export const GuidelinesDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-full max-w-md">
        <ComposedInput
          layout="compact"
          aria-label="Reply"
          placeholder="Reply…"
          leadingToolbarSlot={<Attach />}
          trailingToolbarSlot={<Model label="User" />}
        />
      </div>
    </Specimen>
  ),
}

export const GuidelinesDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-full max-w-72">
        <ComposedInput aria-label="Reply" placeholder="Reply…" leadingToolbarSlot={<Attach />} />
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  const rules = [[GuidelinesDo, GuidelinesDont]] as const
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
