import { Canvas, Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps, type ReactNode } from 'react'
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

/** The five icons by their Figma layer names, for the `leadingSlot` control. */
const iconByName: Record<string, ReactNode> = {
  terminal: icons.default,
  'circle-check': icons.success,
  'triangle-alert': icons.warning,
  'circle-alert': icons.danger,
  info: icons.info,
}

/** The boolean control shows the close button as a switch: `true` becomes `noop` through the mapping below. */
const dismissOn = true as unknown as () => void

/** The icon for `leadingSlot: 'auto'`: the one that matches the current tone. */
const withToneIcon = ({ tone, leadingSlot, ...rest }: ComponentProps<typeof InlineAlert>) => ({
  tone,
  leadingSlot: leadingSlot === 'auto' ? icons[tone ?? 'default'] : leadingSlot,
  ...rest,
})

const meta = {
  title: 'Components/Inline Alert',
  component: InlineAlert,
  args: {
    tone: 'default',
    title: copy.default.title,
    description: copy.default.description,
    // 'auto' follows the tone, as the icon does in Figma; pick another option to pin an icon.
    leadingSlot: 'auto',
    onDismiss: dismissOn,
  },
  argTypes: {
    tone: { control: 'inline-radio', options: tones },
    title: { control: 'text' },
    description: { control: 'text' },
    // The icon and the close button are shown when they are set; the controls switch them on and off.
    leadingSlot: {
      control: 'select',
      options: ['auto', ...Object.keys(iconByName)],
      mapping: { auto: 'auto', ...iconByName },
    },
    onDismiss: { control: 'boolean', mapping: { true: noop, false: undefined } },
    dismissLabel: { control: 'text' },
  },
  parameters: { docs: { page: DocsPage } },
  render: (args) => <InlineAlert {...withToneIcon(args)} />,
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

/** Every tone, each with a title and a description. */
export const Variants: Story = {
  parameters: { wide: true },
  render: () => (
    <div className="grid w-fit grid-cols-[5rem_25rem] items-center gap-x-4 gap-y-3">
      {tones.map((tone) => (
        <div key={tone} className="contents">
          <span className="text-caption text-neutral-subtle">{tone}</span>
          <InlineAlert tone={tone} leadingSlot={icons[tone]} onDismiss={noop} {...copy[tone]} />
        </div>
      ))}
    </div>
  ),
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

/** The close button only calls `onDismiss`; the page decides what to remove and where focus goes next. */
export const Dismissible: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true)
    return open ? (
      <InlineAlert {...withToneIcon(args)} onDismiss={() => setOpen(false)} />
    ) : (
      <Button tone="default" autoFocus variant="outline" size="sm" onClick={() => setOpen(true)}>
        Show alert again
      </Button>
    )
  },
}

/** One side of the guideline: a Do or Don't badge attached to the top, over the live example. */
function Specimen({ tone, children }: { tone: 'do' | 'dont'; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <span
        className={
          tone === 'do'
            ? 'm-1 rounded-sm border-b border-success bg-card-success px-2 py-0.5 text-caption text-success uppercase'
            : 'm-1 rounded-sm border-b border-danger bg-card-danger px-2 py-0.5 text-caption text-danger uppercase'
        }
      >
        {tone === 'do' ? 'Do' : 'Don’t'}
      </span>
      <div className="flex justify-center px-6 pb-6">
        <div className="w-full max-w-104">{children}</div>
      </div>
    </div>
  )
}

const guideline: Pick<Story, 'tags' | 'parameters'> = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', wide: true, controls: { disable: true } },
}

/**
 * **Match the tone to the message**  
 * The tone and its icon carry the meaning. A success alert on an error sends the wrong signal.
 */
export const GuidelineMatchTheToneToTheMessage: Story = {
  ...guideline,
  render: () => (
    <div className="grid grid-cols-2 divide-x divide-neutral-subtle">
      <Specimen tone="do">
        <InlineAlert tone="danger" leadingSlot={icons.danger} onDismiss={noop} {...copy.danger} />
      </Specimen>
      <Specimen tone="dont">
        <InlineAlert tone="success" leadingSlot={icons.success} onDismiss={noop} {...copy.danger} />
      </Specimen>
    </div>
  ),
}

/**
 * **Keep the title short**  
 * The title is read at a glance. A long title is cut off with an ellipsis and hides the point. Move the
 * detail to the description.
 */
export const GuidelineKeepTheTitleShort: Story = {
  ...guideline,
  render: () => (
    <div className="grid grid-cols-2 divide-x divide-neutral-subtle">
      <Specimen tone="do">
        <InlineAlert tone="success" leadingSlot={icons.success} onDismiss={noop} {...copy.success} />
      </Specimen>
      <Specimen tone="dont">
        <InlineAlert
          tone="success"
          leadingSlot={icons.success}
          onDismiss={noop}
          title="Your profile changes have been saved successfully to your account"
          description={copy.success.description}
        />
      </Specimen>
    </div>
  ),
}

/**
 * **Do not repeat the title**  
 * The description adds new detail: what happened or what to do next. Repeating the title only makes the
 * alert longer.
 */
export const GuidelineDoNotRepeatTheTitle: Story = {
  ...guideline,
  render: () => (
    <div className="grid grid-cols-2 divide-x divide-neutral-subtle">
      <Specimen tone="do">
        <InlineAlert tone="info" leadingSlot={icons.info} onDismiss={noop} {...copy.info} />
      </Specimen>
      <Specimen tone="dont">
        <InlineAlert
          tone="info"
          leadingSlot={icons.info}
          onDismiss={noop}
          title="New version available"
          description="A new version is available."
        />
      </Specimen>
    </div>
  ),
}

/** The Docs tab: the usual blocks, then one Guidelines heading with a title, a subtitle and a panel per rule. */
function DocsPage() {
  const rules = [GuidelineMatchTheToneToTheMessage, GuidelineKeepTheTitleShort, GuidelineDoNotRepeatTheTitle]
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      {rules.map((rule, index) => (
        <div key={index}>
          <Description of={rule} />
          <Canvas of={rule} />
        </div>
      ))}
    </>
  )
}
