import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { useArgs } from 'storybook/preview-api'
import { Button } from '../button/button'
import { IconButton } from '../icon-button/icon-button'
import { ChatBubble } from './chat-bubble'
import { Specimen } from '../../docs/specimen'
import { GuidelinePairs } from '../../docs/guideline-pairs'

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.25}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const CopyIcon = () => (
  <Glyph>
    <rect x="9" y="9" width="12" height="12" rx="2" />
    <path d="M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2" />
  </Glyph>
)
const ThumbsUpIcon = () => (
  <Glyph>
    <path d="M7 10v11M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.5l-1.8 7A2 2 0 0 1 18 21H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h2.8a2 2 0 0 0 1.8-1.1L12 3a3.1 3.1 0 0 1 3 2.9Z" />
  </Glyph>
)
const ThumbsDownIcon = () => (
  <Glyph>
    <path d="M17 14V3M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.5l1.8-7A2 2 0 0 1 6 3h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-2.8a2 2 0 0 0-1.8 1.1L12 21a3.1 3.1 0 0 1-3-2.9Z" />
  </Glyph>
)
const RefreshIcon = () => (
  <Glyph>
    <path d="M3 12a9 9 0 0 1 9-9 9.8 9.8 0 0 1 6.7 2.8L21 8M21 3v5h-5M21 12a9 9 0 0 1-9 9 9.8 9.8 0 0 1-6.7-2.8L3 16M8 16H3v5" />
  </Glyph>
)
const ArrowDownIcon = () => (
  <Glyph>
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </Glyph>
)
const ArrowUpIcon = () => (
  <Glyph>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Glyph>
)
const ClockIcon = () => (
  <Glyph>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </Glyph>
)

const Stat = ({ icon, value }: { icon: ReactNode; value: string }) => (
  <span className="flex items-center gap-1">
    {icon}
    {value}
  </span>
)

type ActionTone = 'default' | 'accent'
const actionsOf = (tone: ActionTone = 'default', variant: 'ghost' | 'solid' = 'ghost') => (
  <>
    <IconButton aria-label="Copy" tone={tone} variant={variant} size="sm">
      <CopyIcon />
    </IconButton>
    <IconButton aria-label="Like" tone={tone} variant={variant} size="sm">
      <ThumbsUpIcon />
    </IconButton>
    <IconButton aria-label="Dislike" tone={tone} variant={variant} size="sm">
      <ThumbsDownIcon />
    </IconButton>
    <IconButton aria-label="Regenerate" tone={tone} variant={variant} size="sm">
      <RefreshIcon />
    </IconButton>
  </>
)
const actions = actionsOf()

const stats = (
  <>
    <Stat icon={<ArrowDownIcon />} value="92" />
    <Stat icon={<ArrowUpIcon />} value="206" />
    <Stat icon={<ClockIcon />} value="1.7s" />
  </>
)

const thought =
  'We need answer user’s request. Need extract name, email, order ids as JSON from text. Need likely JSON. Need be careful.'
const answer = '{"name":"dana","email":"dana.k@example.com","order_ids":["A-1289","B-77"]}'
const longThought =
  'We need answer user’s request. Need extract name, email, order ids as JSON from text. Need likely JSON. Need be careful. Input: "Hi its dana (dana.k@example.com) orders A-1289 and also AB-77 never arrived, resend both pls". Need output JSON with name, email, order_ids. Could be ["Dana", ...] or maybe include #? Need decide. Could include as strings. Need final only JSON? User asks extract as JSON. We can provide JSON. Ensure valid.'

const meta = {
  title: 'Components/Chat Bubble',
  component: ChatBubble,
  args: { content: thought, reasoningLabel: 'Thought for 0.8s', message: answer, actions, stats, defaultOpen: true },
  argTypes: {
    content: { control: 'text' },
    reasoningLabel: { control: 'text' },
    message: { control: 'text' },
    actions: { control: false },
    stats: { control: false },
    open: { control: false },
  },
  decorators: [
    (Story) => (
      <div className="w-130 max-w-full">
        <Story />
      </div>
    ),
  ],
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof ChatBubble>

export default meta
type Story = StoryObj<typeof meta>

/** Click the header to fold the reasoning block, or use the controls: both change `open`. */
export const Playground: Story = {
  args: { open: true },
  render: function Render(args) {
    const [, updateArgs] = useArgs()
    return <ChatBubble {...args} onOpenChange={(open) => updateArgs({ open })} />
  },
}

/** The two states of the reasoning block, the `open` property in Figma: `true` shows the thought text under the header, `false` folds it to the header. */
export const Variants: Story = {
  decorators: [],
  render: (args) => (
    <div className="grid w-full grid-cols-2 items-start gap-x-8">
      <span className="text-caption pb-4 text-center text-neutral-subtle">open</span>
      <span className="text-caption pb-4 text-center text-neutral-subtle">closed</span>
      <ChatBubble {...args} defaultOpen />
      <ChatBubble {...args} defaultOpen={false} />
    </div>
  ),
}

/** While the answer is streaming the toolbar is hidden: set neither `actions` nor `stats`. */
export const Streaming: Story = {
  args: { actions: undefined, stats: undefined, defaultOpen: false, message: '{"name":"dana","email":"dana.k@' },
}

/** Only the answer, for a reply that has no thinking text and no toolbar. */
export const MessageOnly: Story = {
  args: { content: undefined, actions: undefined, stats: undefined, defaultOpen: false },
}

/** The block can be controlled from outside with `open` and `onOpenChange`. */
export const Controlled: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(true)
    return (
      <div className="flex flex-col items-start gap-4">
        <Button variant="outline" tone="default" size="sm" onClick={() => setOpen((value) => !value)}>
          {open ? 'Fold the reasoning' : 'Show the reasoning'}
        </Button>
        <ChatBubble {...args} open={open} onOpenChange={setOpen} />
      </div>
    )
  },
}

/**
 * **Fold the reasoning once the answer is ready.**  
 * Close the thinking block once the answer is ready, so the answer stays the first thing people read.
 * Open it only on request.
 */
export const Guideline1Do: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: (args) => (
    <Specimen tone="do">
      <div className="w-full max-w-lg">
        <ChatBubble {...args} defaultOpen={false} />
      </div>
    </Specimen>
  ),
}

export const Guideline1Dont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: (args) => (
    <Specimen tone="dont">
      <div className="w-full max-w-lg">
        <ChatBubble {...args} content={longThought} defaultOpen />
      </div>
    </Specimen>
  ),
}

/**
 * **Keep the toolbar quiet with ghost icon buttons.**  
 * Toolbar actions are secondary to the answer. Use ghost icon buttons so they do not compete with it.
 */
export const Guideline2Do: Story = {
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: (args) => (
    <Specimen tone="do">
      <div className="w-full max-w-lg">
        <ChatBubble {...args} defaultOpen={false} />
      </div>
    </Specimen>
  ),
}

export const Guideline2Dont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: (args) => (
    <Specimen tone="dont">
      <div className="w-full max-w-lg">
        <ChatBubble {...args} actions={actionsOf('accent', 'solid')} defaultOpen={false} />
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  const rules = [
    [Guideline1Do, Guideline1Dont],
    [Guideline2Do, Guideline2Dont],
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
