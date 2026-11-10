import { Canvas, Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import { Button } from '../button/button'
import { toast, Toast, ToastAction, ToastProvider, Toaster, ToastViewport } from './toast'
import { Specimen } from '../../docs/specimen'

const Glyph = ({ children }: { children: ReactNode }) => (
  <svg
    viewBox="0 0 20 20"
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

const BellIcon = () => (
  <Glyph>
    <path d="M5 8a5 5 0 0110 0c0 4 1.5 5.5 1.5 5.5h-13S5 12 5 8zM8.5 16.5a1.5 1.5 0 003 0" />
  </Glyph>
)
const SuccessIcon = () => (
  <Glyph>
    <circle cx="10" cy="10" r="7.25" />
    <path d="M6.5 10.5l2.5 2.5 4.5-5" />
  </Glyph>
)
const InfoIcon = () => (
  <Glyph>
    <circle cx="10" cy="10" r="7.25" />
    <path d="M10 9v4.5M10 6.5v.01" />
  </Glyph>
)
const WarningIcon = () => (
  <Glyph>
    <path d="M10 3.5l7 12.5H3L10 3.5zM10 8.5v3.5M10 14v.01" />
  </Glyph>
)
const DangerIcon = () => (
  <Glyph>
    <circle cx="10" cy="10" r="7.25" />
    <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" />
  </Glyph>
)

const successIcon = (
  <span className="text-success">
    <SuccessIcon />
  </span>
)
const infoIcon = (
  <span className="text-info">
    <InfoIcon />
  </span>
)
const warningIcon = (
  <span className="text-warning">
    <WarningIcon />
  </span>
)
const dangerIcon = (
  <span className="text-danger">
    <DangerIcon />
  </span>
)

/** A provider and a viewport that sit in the page flow, so a story can show toasts in place. */
const Stage = ({ children, label }: { children: ReactNode; label?: string }) => (
  <ToastProvider duration={Infinity}>
    <ToastViewport label={label} className="static w-100" />
    {children}
  </ToastProvider>
)

/** Stories show a toast that never goes away: after the close button it comes back a moment later. */
const Pinned = (props: ComponentProps<typeof Toast>) => {
  const [open, setOpen] = useState(true)
  return (
    <Toast
      {...props}
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setTimeout(() => setOpen(true), 800)
      }}
    />
  )
}

const undo = <ToastAction altText="Undo the change">Undo</ToastAction>

const meta = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    label: 'Event has been created',
    description: 'Sunday, December 03 at 9:00 AM',
    leadingSlot: true,
    action: true,
    closeLabel: 'Close',
  },
  argTypes: {
    // Switches: on shows an icon / an Undo action, off leaves the slot empty.
    leadingSlot: { control: 'boolean' },
    action: { control: 'boolean' },
  },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

/** One toast with every property. Several toasts pile up on their own: see Stack and Triggered. */
export const Playground: Story = {
  render: (args) => (
    <Stage>
      <Pinned
        {...args}
        leadingSlot={args.leadingSlot ? <BellIcon /> : undefined}
        action={args.action ? undo : undefined}
      />
    </Stage>
  ),
}

const copy = { label: 'Event has been created', description: 'Sunday, December 03 at 9:00 AM' }

const kinds = [
  { name: 'default', icon: <BellIcon /> },
  { name: 'success', icon: successIcon },
  { name: 'info', icon: infoIcon },
  { name: 'warning', icon: warningIcon },
  { name: 'danger', icon: dangerIcon },
]

/** The icon and its color carry the meaning: neutral, success, info, warning and danger, each with and without the action. */
export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(2,max-content)] items-center gap-x-6 gap-y-6">
      <span />
      <span className="text-caption text-neutral-subtle">with action</span>
      <span className="text-caption text-neutral-subtle">without action</span>
      {kinds.map((kind) => (
        <div key={kind.name} className="contents">
          <span className="text-caption text-neutral-subtle">{kind.name}</span>
          {[undo, undefined].map((action, index) => (
            <Stage key={index} label={`Notifications: ${kind.name}, ${action ? 'with action' : 'without action'}`}>
              <Pinned {...copy} leadingSlot={kind.icon} action={action} />
            </Stage>
          ))}
        </div>
      ))}
    </div>
  ),
}

const stackToasts = [
  { label: 'Event has been created', description: 'Sunday, December 03 at 9:00 AM' },
  { label: 'Event has been updated', description: 'Monday, December 04 at 10:30 AM' },
  { label: 'Event has been deleted', description: 'Tuesday, December 05 at 4:15 PM' },
]

const StackDemo = ({ expand }: { expand?: boolean }) => {
  useEffect(() => {
    const ids = stackToasts.map((item) =>
      toast({
        ...item,
        leadingSlot: <BellIcon />,
        action: { label: 'Undo', altText: 'Undo the change' },
        duration: Infinity,
      }),
    )
    return () => ids.forEach((id) => toast.dismiss(id))
  }, [])
  return (
    <div className="h-96">
      <Toaster expand={expand} />
    </div>
  )
}

// `toast()` keeps one list for the whole page, and every mounted Toaster shows it. On the Docs page each
// Toaster story runs in its own frame, so the two demos do not show each other's toasts.
const isolatedDocs = { docs: { story: { inline: false, height: '440px' } } }

/**
 * Three toasts in a real `Toaster`. They pile up by themselves: the newest in front, the older ones
 * smaller and lifted behind it. Hover or focus the pile to open it into a list; leave to fold it.
 * `expand` keeps it open.
 */
export const Stack: StoryObj<{ expand: boolean }> = {
  args: { expand: false },
  parameters: isolatedDocs,
  argTypes: { expand: { control: 'boolean' } },
  render: ({ expand }) => <StackDemo expand={expand} />,
}

const TriggeredDemo = () => (
  <div className="flex items-center gap-2">
    <Button
      tone="default"
      variant="outline"
      onClick={() =>
        toast({
          ...copy,
          leadingSlot: <BellIcon />,
          action: { label: 'Undo', altText: 'Undo the change' },
        })
      }
    >
      Create event
    </Button>
    <Button tone="default" variant="ghost" onClick={() => toast.dismiss()}>
      Dismiss all
    </Button>
    <Toaster />
  </div>
)

/**
 * The real thing: a `Toaster` mounted once and `toast()` called from a button. Press the button a few
 * times: toasts pile up (three at most), open on hover, and close after five seconds, on the action,
 * on the close button and on a swipe.
 */
export const Triggered: Story = {
  parameters: isolatedDocs,
  // The Toaster is pinned to the corner of the story frame; the frame needs room for three toasts opened into a list.
  render: () => (
    <div className="h-96">
      <TriggeredDemo />
    </div>
  ),
}

const date = 'Sunday, December 03 at 9:00 AM'

/**
 * Keep the title short. A toast disappears in a few seconds, so the title must read in one glance. A
 * long title is cut off with an ellipsis. Move the detail to the description.
 */
export const GuidelineKeepTheTitleShortDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Stage label="Notifications: Do, keep the title short">
        <Pinned label="Event created" description={date} leadingSlot={successIcon} />
      </Stage>
    </Specimen>
  ),
}

export const GuidelineKeepTheTitleShortDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Stage label="Notifications: Don’t, keep the title short">
        <Pinned
          label="Your event has been successfully created and added to the shared team calendar"
          description={date}
          leadingSlot={successIcon}
        />
      </Stage>
    </Specimen>
  ),
}

/**
 * Match the icon to the meaning. The icon and its color carry the meaning. A Success icon on an error
 * message sends the wrong signal.
 */
export const GuidelineMatchTheIconToTheMeaningDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Stage label="Notifications: Do, match the icon to the meaning">
        <Pinned label="Upload failed" description="The file is larger than 10 MB" leadingSlot={dangerIcon} />
      </Stage>
    </Specimen>
  ),
}

export const GuidelineMatchTheIconToTheMeaningDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Stage label="Notifications: Don’t, match the icon to the meaning">
        <Pinned label="Upload failed" description="The file is larger than 10 MB" leadingSlot={successIcon} />
      </Stage>
    </Specimen>
  ),
}

/**
 * Do not repeat the title. The description adds new detail: who, when or what changed. Repeating the
 * title only makes the toast longer.
 */
export const GuidelineDoNotRepeatTheTitleDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Stage label="Notifications: Do, do not repeat the title">
        <Pinned label="Event has been created" description={date} leadingSlot={successIcon} />
      </Stage>
    </Specimen>
  ),
}

export const GuidelineDoNotRepeatTheTitleDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Stage label="Notifications: Don’t, do not repeat the title">
        <Pinned label="Event has been created" description="Your event has been created" leadingSlot={successIcon} />
      </Stage>
    </Specimen>
  ),
}

/**
 * Use the action to undo or view. The action reverses the change or opens the result. A toast closes
 * by itself, so an OK button adds nothing.
 */
export const GuidelineUseTheActionToUndoOrViewDo: Story = {
  name: 'Guideline 4 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Stage label="Notifications: Do, use the action to undo or view">
        <Pinned
          label="Event deleted"
          description={date}
          leadingSlot={<BellIcon />}
          action={<ToastAction altText="Undo the deletion">Undo</ToastAction>}
        />
      </Stage>
    </Specimen>
  ),
}

export const GuidelineUseTheActionToUndoOrViewDont: Story = {
  name: 'Guideline 4 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Stage label="Notifications: Don’t, use the action to undo or view">
        <Pinned
          label="Event deleted"
          description={date}
          leadingSlot={<BellIcon />}
          action={<ToastAction altText="Close the notification">OK</ToastAction>}
        />
      </Stage>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  const rules = [
    [GuidelineKeepTheTitleShortDo, GuidelineKeepTheTitleShortDont],
    [GuidelineMatchTheIconToTheMeaningDo, GuidelineMatchTheIconToTheMeaningDont],
    [GuidelineDoNotRepeatTheTitleDo, GuidelineDoNotRepeatTheTitleDont],
    [GuidelineUseTheActionToUndoOrViewDo, GuidelineUseTheActionToUndoOrViewDont],
  ] as const
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      {rules.map(([Do, Dont], index) => (
        <div key={index} className={`${index === 0 ? '-mt-2!' : 'mt-8!'} [&_p]:mb-0!`}>
          {/* Figma has a caption only over the Do card, so it takes the whole row; the cards sit side by side below. */}
          <Description of={Do} />
          <div className="grid grid-cols-2 gap-x-6">
            <div>
              <Canvas of={Do} />
            </div>
            <div>
              <Canvas of={Dont} />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
