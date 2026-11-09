import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { Button } from '../button/button'
import { InlineAlert } from './inline-alert'

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
)

const TerminalIcon = () => (
  <Glyph>
    <path d="M3 4.5l3.5 3.5L3 11.5M8.5 12h4.5" />
  </Glyph>
)
const SuccessIcon = () => (
  <Glyph>
    <circle cx="8" cy="8" r="6" />
    <path d="M5.5 8.25l1.75 1.75 3.25-3.5" />
  </Glyph>
)
const WarningIcon = () => (
  <Glyph>
    <path d="M8 2.5l6 10.5H2L8 2.5zM8 6.5v3M8 11.25v.01" />
  </Glyph>
)
const DangerIcon = () => (
  <Glyph>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 5v3.5M8 10.75v.01" />
  </Glyph>
)
const InfoIcon = () => (
  <Glyph>
    <circle cx="8" cy="8" r="6" />
    <path d="M8 7.25V11M8 5.25v.01" />
  </Glyph>
)

const tones = ['default', 'success', 'warning', 'danger', 'info'] as const
type Tone = (typeof tones)[number]

const icons: Record<Tone, ReactNode> = {
  default: <TerminalIcon />,
  success: <SuccessIcon />,
  warning: <WarningIcon />,
  danger: <DangerIcon />,
  info: <InfoIcon />,
}

const copy: Record<Tone, { title: string; description: string }> = {
  default: { title: 'Heads up!', description: 'You can add components to your app using the CLI.' },
  success: { title: 'Changes saved', description: 'Your profile was updated successfully.' },
  warning: { title: 'Check your plan', description: 'You are close to your monthly usage limit.' },
  danger: { title: 'Payment failed', description: 'Your card was declined. Update your billing details.' },
  info: { title: 'New version available', description: 'Reload the page to get the latest improvements.' },
}

const noop = () => {}

const meta = {
  title: 'Components/Inline Alert',
  component: InlineAlert,
  args: {
    tone: 'default',
    title: copy.default.title,
    description: copy.default.description,
    leadingSlot: icons.default,
    onDismiss: noop,
  },
  argTypes: {
    tone: { control: 'inline-radio', options: tones },
    title: { control: 'text' },
    description: { control: 'text' },
    // The icon and the close button are shown when they are set; the controls switch them on and off.
    leadingSlot: {
      control: 'select',
      options: ['none', ...tones],
      mapping: { none: undefined, ...icons },
    },
    onDismiss: { control: 'boolean', mapping: { true: noop, false: undefined } },
    dismissLabel: { control: 'text' },
  },
  // The alert fills its container, so single examples sit in a 400px column.
  decorators: [
    (Story, { parameters }) =>
      parameters.wide ? (
        <Story />
      ) : (
        <div className="w-100 max-w-full">
          <Story />
        </div>
      ),
  ],
} satisfies Meta<typeof InlineAlert>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Every tone with a description, as a title only and without the close button. */
export const Variants: Story = {
  parameters: { wide: true },
  render: () => (
    <div className="grid grid-cols-[auto_repeat(3,25rem)] items-center gap-3">
      <span />
      <span className="text-caption text-neutral-subtle">with description</span>
      <span className="text-caption text-neutral-subtle">title only</span>
      <span className="text-caption text-neutral-subtle">not dismissible</span>
      {tones.map((tone) => (
        <div key={tone} className="contents">
          <span className="text-caption text-neutral-subtle">{tone}</span>
          <InlineAlert tone={tone} leadingSlot={icons[tone]} onDismiss={noop} {...copy[tone]} />
          <InlineAlert tone={tone} leadingSlot={icons[tone]} onDismiss={noop} title={copy[tone].title} />
          <InlineAlert tone={tone} leadingSlot={icons[tone]} {...copy[tone]} />
        </div>
      ))}
    </div>
  ),
}

/** The description is optional: a title that says everything needs no second line. */
export const TitleOnly: Story = {
  args: { tone: 'success', title: 'Changes saved', description: undefined, leadingSlot: icons.success },
}

/** Without a close button the alert stays until the page changes it. */
export const NotDismissible: Story = {
  args: { tone: 'warning', ...copy.warning, leadingSlot: icons.warning, onDismiss: undefined },
}

/** Without a leading slot the text starts at the left edge. */
export const WithoutIcon: Story = {
  args: { tone: 'info', ...copy.info, leadingSlot: undefined },
}

/** A long title is cut off with an ellipsis; put the detail in the description. */
export const LongTitle: Story = {
  args: {
    tone: 'success',
    title: 'Your profile changes have been saved successfully to your account',
    description: copy.success.description,
    leadingSlot: icons.success,
  },
}

/** The close button only calls `onDismiss`; the page decides what to remove. */
export const Dismissible: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)
    return open ? (
      <InlineAlert {...args} onDismiss={() => setOpen(false)} />
    ) : (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        Show alert again
      </Button>
    )
  },
}

/** A Do and a Don't side by side. */
const Pair = ({ doExample, dontExample }: { doExample: ReactNode; dontExample: ReactNode }) => (
  <div className="grid w-full max-w-3xl grid-cols-2 gap-4">
    {[
      { label: 'Do', className: 'text-success', example: doExample },
      { label: "Don't", className: 'text-danger', example: dontExample },
    ].map(({ label, className, example }) => (
      <div key={label} className="flex min-w-0 flex-col gap-2">
        <span className={`text-label-small ${className}`}>{label}</span>
        {example}
      </div>
    ))}
  </div>
)

/** The tone and its icon carry the meaning. A success alert on an error sends the wrong signal. */
export const MatchTheToneToTheMessage: Story = {
  parameters: { wide: true },
  render: () => (
    <Pair
      doExample={<InlineAlert tone="danger" leadingSlot={icons.danger} onDismiss={noop} {...copy.danger} />}
      dontExample={<InlineAlert tone="success" leadingSlot={icons.success} onDismiss={noop} {...copy.danger} />}
    />
  ),
}

/** The title is read at a glance. A long title is cut off with an ellipsis and hides the point; move the detail to the description. */
export const KeepTheTitleShort: Story = {
  parameters: { wide: true },
  render: () => (
    <Pair
      doExample={<InlineAlert tone="success" leadingSlot={icons.success} onDismiss={noop} {...copy.success} />}
      dontExample={
        <InlineAlert
          tone="success"
          leadingSlot={icons.success}
          onDismiss={noop}
          title="Your profile changes have been saved successfully to your account"
          description={copy.success.description}
        />
      }
    />
  ),
}

/** The description adds new detail: what happened or what to do next. Repeating the title only makes the alert longer. */
export const DoNotRepeatTheTitle: Story = {
  parameters: { wide: true },
  render: () => (
    <Pair
      doExample={<InlineAlert tone="info" leadingSlot={icons.info} onDismiss={noop} {...copy.info} />}
      dontExample={
        <InlineAlert
          tone="info"
          leadingSlot={icons.info}
          onDismiss={noop}
          title="New version available"
          description="A new version is available."
        />
      }
    />
  ),
}
