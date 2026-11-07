import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ComponentProps, type ReactNode } from 'react'
import { Button } from '../button/button'
import { Toast, ToastAction, ToastProvider, ToastViewport } from './toast'

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
const Stage = ({ children, state }: { children: ReactNode; state?: 'stacked' | 'expanded' }) => (
  <ToastProvider duration={Infinity}>
    <ToastViewport state={state} className="static w-100" />
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

const meta = {
  title: 'Components/Toast',
  component: Toast,
  args: {
    label: 'Event has been created',
    description: 'Sunday, December 03 at 9:00 AM',
    state: 'default',
    leadingSlot: 'icon',
    action: 'undo',
    closeLabel: 'Close',
  },
  argTypes: {
    state: { control: 'inline-radio', options: ['default', 'stacked', 'expanded'] },
    leadingSlot: {
      control: 'inline-radio',
      options: ['icon', 'none'],
      mapping: { icon: <BellIcon />, none: undefined },
    },
    action: {
      control: 'inline-radio',
      options: ['undo', 'none'],
      mapping: { undo: <ToastAction altText="Undo the change">Undo</ToastAction>, none: undefined },
    },
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

/** The `state` control switches the view: one card, a card with layers behind it, or an expanded list of three. */
export const Playground: Story = {
  render: (args) => (
    <div className="pt-8">
      <Stage>
        {args.state === 'expanded' ? [0, 1, 2].map((item) => <Pinned key={item} {...args} />) : <Pinned {...args} />}
      </Stage>
    </div>
  ),
}

const undo = <ToastAction altText="Undo the change">Undo</ToastAction>
const copy = { label: 'Event has been created', description: 'Sunday, December 03 at 9:00 AM' }

/** Every state, with and without the action. Expanded is a list: each toast is a full card. */
export const States: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(2,max-content)] items-center gap-x-6 gap-y-12">
      <span />
      <span className="text-caption text-neutral-subtle">with action</span>
      <span className="text-caption text-neutral-subtle">without action</span>
      {(['default', 'stacked', 'expanded'] as const).map((state) => (
        <div key={state} className="contents">
          <span className="text-caption text-neutral-subtle">{state}</span>
          {[undo, undefined].map((action, index) => (
            <div key={index} className={state === 'stacked' ? 'pt-8' : undefined}>
              <Stage>
                {state === 'expanded' ? (
                  [0, 1, 2].map((item) => (
                    <Pinned key={item} {...copy} state={state} leadingSlot={<BellIcon />} action={action} />
                  ))
                ) : (
                  <Pinned {...copy} state={state} leadingSlot={<BellIcon />} action={action} />
                )}
              </Stage>
            </div>
          ))}
        </div>
      ))}
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

const TriggeredDemo = () => {
  const [count, setCount] = useState(0)
  return (
    <ToastProvider duration={5000}>
      <Button onClick={() => setCount((value) => value + 1)}>Create event</Button>
      {Array.from({ length: count }, (_, index) => (
        <Toast key={index} {...copy} leadingSlot={<BellIcon />} action={undo} />
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}

/** A real toast: it opens from a button, closes itself after five seconds, and also goes on the action or the close button. */
export const Triggered: Story = { render: () => <TriggeredDemo /> }

const StackDemo = () => {
  const [state, setState] = useState<'stacked' | 'expanded'>('stacked')
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button variant={state === 'stacked' ? 'solid' : 'outline'} onClick={() => setState('stacked')}>
          Stacked
        </Button>
        <Button variant={state === 'expanded' ? 'solid' : 'outline'} onClick={() => setState('expanded')}>
          Expanded
        </Button>
        <span className="text-caption text-neutral-subtle">Hover the pile to open it.</span>
      </div>
      <div className="pt-8">
        <Stage state={state}>
          <Pinned
            label="Event has been created"
            description="Sunday, December 03 at 9:00 AM"
            leadingSlot={<BellIcon />}
            action={undo}
          />
          <Pinned
            label="Event has been updated"
            description="Monday, December 04 at 10:30 AM"
            leadingSlot={<BellIcon />}
            action={undo}
          />
          <Pinned
            label="Event has been deleted"
            description="Tuesday, December 05 at 4:15 PM"
            leadingSlot={<BellIcon />}
            action={undo}
          />
        </Stage>
      </div>
    </div>
  )
}

/**
 * Several toasts, as a pile or as a list. `ToastViewport state="stacked"` shows the newest toast in
 * front with two layers behind it; hovering or focusing the pile opens it into the `expanded` list,
 * and moving away closes it. The buttons switch the viewport between the two.
 */
export const Stack: Story = { render: () => <StackDemo /> }
