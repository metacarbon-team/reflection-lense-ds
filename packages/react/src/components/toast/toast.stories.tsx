import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useState, type ComponentProps, type ReactNode } from 'react'
import { Button } from '../button/button'
import { toast, Toast, ToastAction, ToastProvider, Toaster, ToastViewport } from './toast'

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

/** Every combination of the icon, the description and the action. The close button is always there. */
export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(2,max-content)] items-center gap-x-6 gap-y-6">
      <span />
      <span className="text-caption text-neutral-subtle">with action</span>
      <span className="text-caption text-neutral-subtle">without action</span>
      {[true, false].flatMap((icon) =>
        [true, false].map((description) => (
          <div key={`${icon}-${description}`} className="contents">
            <span className="text-caption text-neutral-subtle">
              {icon ? 'icon' : 'no icon'}, {description ? 'description' : 'no description'}
            </span>
            {[undo, undefined].map((action, index) => (
              <Stage
                key={index}
                label={`Notifications: ${icon ? 'icon' : 'no icon'}, ${description ? 'description' : 'no description'}, ${action ? 'action' : 'no action'}`}
              >
                <Pinned
                  label={copy.label}
                  description={description ? copy.description : undefined}
                  leadingSlot={icon ? <BellIcon /> : undefined}
                  action={action}
                />
              </Stage>
            ))}
          </div>
        )),
      )}
    </div>
  ),
}

/** The leading slot carries the meaning: a neutral bell, or an icon in a status color. */
export const StatusIcons: Story = {
  render: () => (
    <Stage>
      <Pinned {...copy} leadingSlot={<BellIcon />} action={undo} />
      <Pinned
        {...copy}
        leadingSlot={
          <span className="text-success">
            <SuccessIcon />
          </span>
        }
      />
      <Pinned
        {...copy}
        leadingSlot={
          <span className="text-info">
            <InfoIcon />
          </span>
        }
      />
      <Pinned
        {...copy}
        leadingSlot={
          <span className="text-warning">
            <WarningIcon />
          </span>
        }
      />
      <Pinned
        {...copy}
        leadingSlot={
          <span className="text-danger">
            <DangerIcon />
          </span>
        }
      />
    </Stage>
  ),
}

/** Only the title is required. The icon, the description and the action are left out. */
export const TitleOnly: Story = {
  render: () => (
    <Stage>
      <Pinned label="Event has been created" />
    </Stage>
  ),
}

/** A title that does not fit is cut with an ellipsis; move the detail to the description. */
export const LongTitle: Story = {
  render: () => (
    <Stage>
      <Pinned
        label="Your event has been successfully created and added to the shared calendar"
        description="Sunday, December 03 at 9:00 AM"
        leadingSlot={
          <span className="text-success">
            <SuccessIcon />
          </span>
        }
      />
    </Stage>
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

/**
 * Three toasts in a real `Toaster`. They pile up by themselves: the newest in front, the older ones
 * smaller and lifted behind it. Hover or focus the pile to open it into a list; leave to fold it.
 * `expand` keeps it open.
 */
export const Stack: StoryObj<{ expand: boolean }> = {
  args: { expand: false },
  argTypes: { expand: { control: 'boolean' } },
  render: ({ expand }) => <StackDemo expand={expand} />,
}

const TriggeredDemo = () => (
  <div className="flex items-center gap-2">
    <Button
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
    <Button variant="outline" onClick={() => toast({ label: 'Saved' })}>
      Short toast
    </Button>
    <Button variant="ghost" onClick={() => toast.dismiss()}>
      Dismiss all
    </Button>
    <Toaster />
  </div>
)

/**
 * The real thing: a `Toaster` mounted once and `toast()` called from a button. Press the buttons a few
 * times: toasts pile up (three at most), open on hover, and close after five seconds, on the action,
 * on the close button and on a swipe.
 */
export const Triggered: Story = {
  // The Toaster is pinned to the corner of the story frame; the frame needs room for three toasts opened into a list.
  render: () => (
    <div className="h-96">
      <TriggeredDemo />
    </div>
  ),
}
