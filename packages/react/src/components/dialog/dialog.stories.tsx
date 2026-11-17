import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { cn } from '../../lib/cn'
import { CloseIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { Field } from '../field/field'
import { IconButton } from '../icon-button/icon-button'
import { Input } from '../input/input'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const WarningGlyph = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 3.5l7 12.5H3L10 3.5zM10 8.5v3.5M10 14v.01" />
  </svg>
)

const meta = {
  title: 'Components/Dialog',
  component: DialogContent,
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof DialogContent>

export default meta
type Story = StoryObj<typeof meta>

type PlaygroundArgs = {
  layout: 'inline' | 'stacked'
  title: string
  description: string
  icon: boolean
  content: boolean
  showCloseButton?: boolean
}

/** One real dialog with every property: modal, focus trapped, Escape and the backdrop close it. */
export const Playground: StoryObj<PlaygroundArgs> = {
  args: {
    layout: 'inline',
    title: 'Dialog title',
    description: 'Short description of what this dialog does.',
    icon: false,
    content: true,
  },
  argTypes: {
    layout: { control: 'inline-radio', options: ['inline', 'stacked'] },
    title: { description: 'DialogTitle. Names the decision or the task, for example Delete project?' },
    description: { description: 'DialogDescription. One sentence on the result of the action. Empty hides it.' },
    // Switches: on shows the Icon Box / the body, off leaves them out.
    icon: { control: 'boolean', description: 'The `icon` of DialogHeader: drawn in an Icon Box above the title.' },
    content: { control: 'boolean', description: 'DialogBody with the fields, the list or the question text.' },
    showCloseButton: { control: 'boolean' },
  },
  render: ({ layout, title, description, icon, content, showCloseButton }) => (
    <Dialog>
      <DialogTrigger asChild>
        <Button tone="default" variant="outline">
          Open dialog
        </Button>
      </DialogTrigger>
      <DialogContent layout={layout} showCloseButton={showCloseButton}>
        <DialogHeader icon={icon ? <WarningGlyph /> : undefined}>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {content && (
          <DialogBody>
            <Field label="Name">
              <Input defaultValue="Reflection copy" />
            </Field>
          </DialogBody>
        )}
        <DialogFooter>
          {layout === 'stacked' ? (
            <>
              <Button size="sm">Save changes</Button>
              <DialogClose asChild>
                <Button tone="default" variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
            </>
          ) : (
            <>
              <DialogClose asChild>
                <Button tone="default" variant="outline" size="sm">
                  Cancel
                </Button>
              </DialogClose>
              <Button size="sm">Save changes</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/**
 * The dialog surface in the page flow, for the matrix and the guidelines. It has the classes of
 * DialogContent but no overlay and no focus trap, so many fit on one page. The real thing is Playground.
 */
function Surface({
  layout = 'inline',
  closeButton = layout === 'inline',
  className,
  children,
}: {
  layout?: 'inline' | 'stacked'
  closeButton?: boolean
  className?: string
  children: ReactNode
}) {
  return (
    // An open Dialog only gives DialogTitle and DialogDescription their context; no content is mounted.
    <Dialog open>
      <div
        data-layout={layout}
        data-close-button={closeButton || undefined}
        className={cn(
          'group/dialog relative flex w-full max-w-md flex-col rounded-xl border border-neutral bg-card-neutral-subtle text-neutral shadow-xl',
          className,
        )}
      >
        {children}
        {closeButton && (
          <IconButton aria-label="Close" tone="default" variant="ghost" size="sm" className="absolute top-4 right-4">
            <CloseIcon />
          </IconButton>
        )}
      </div>
    </Dialog>
  )
}

const cancel = (
  <Button tone="default" variant="outline" size="sm">
    Cancel
  </Button>
)

function Sample({
  layout,
  icon,
  title = 'Dialog title',
  description = 'Short description of what this dialog does.',
  actions,
  className,
  body = false,
}: {
  layout?: 'inline' | 'stacked'
  icon?: boolean
  title?: string
  description?: string
  actions: ReactNode
  className?: string
  body?: boolean
}) {
  return (
    <Surface layout={layout} className={className}>
      <DialogHeader icon={icon ? <WarningGlyph /> : undefined}>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {body && (
        <DialogBody>
          <Field label="Name">
            <Input defaultValue="Reflection copy" />
          </Field>
        </DialogBody>
      )}
      <DialogFooter>{actions}</DialogFooter>
    </Surface>
  )
}

const inlineActions = (
  <>
    {cancel}
    <Button size="sm">Save changes</Button>
  </>
)
const stackedActions = (
  <>
    <Button size="sm">Save changes</Button>
    {cancel}
  </>
)

/** The two layouts, each without and with an Icon Box, as in the Figma matrix. */
export const Variants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(2,24rem)] items-start gap-x-8 gap-y-6">
      <span />
      <span className="text-caption text-neutral-subtle">inline</span>
      <span className="text-caption text-neutral-subtle">stacked</span>
      {[false, true].map((icon) => (
        <div key={String(icon)} className="contents">
          <span className="text-caption text-neutral-subtle">{icon ? 'icon' : 'default'}</span>
          <Sample layout="inline" icon={icon} body actions={inlineActions} />
          <Sample layout="stacked" icon={icon} body actions={stackedActions} />
        </div>
      ))}
    </div>
  ),
}

/** Inline: the text on the left, the actions in one row at the end, a close button in the corner. */
export const Inline: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button tone="default" variant="outline">
          Rename theme
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename theme</DialogTitle>
          <DialogDescription>Themes are saved in this browser.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <Field label="Name">
            <Input defaultValue="Reflection copy" />
          </Field>
        </DialogBody>
        <DialogFooter>
          <DialogClose asChild>{cancel}</DialogClose>
          <Button size="sm" variant="solid" tone="accent">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** Stacked: the text is centered, the actions are full width with the primary one first. No close button. */
export const Stacked: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" tone="danger">
          Delete theme
        </Button>
      </DialogTrigger>
      <DialogContent layout="stacked" className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Reflection copy?</DialogTitle>
          <DialogDescription>The theme is removed from this browser.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" variant="solid" tone="danger">
            Delete
          </Button>
          <DialogClose asChild>{cancel}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** `icon` puts an Icon Box with that icon above the title. Use it for one small icon that sets the tone, such as a warning. */
export const WithIconBox: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" tone="danger">
          Delete theme
        </Button>
      </DialogTrigger>
      <DialogContent layout="stacked" className="max-w-sm">
        <DialogHeader icon={<WarningGlyph />}>
          <DialogTitle>Delete Reflection copy?</DialogTitle>
          <DialogDescription>The theme is removed from this browser.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button size="sm" variant="solid" tone="danger">
            Delete
          </Button>
          <DialogClose asChild>{cancel}</DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

const danger = (label: string) => (
  <Button size="sm" tone="danger">
    {label}
  </Button>
)

/**
 * **Name the action**
 * The title asks the real question and the main button repeats the action. Vague words like Are you
 * sure? and OK make the user read everything to understand.
 */
export const GuidelineNameTheActionDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Sample
        className="max-w-sm"
        title="Delete project?"
        description="This cannot be undone."
        actions={
          <>
            {cancel}
            {danger('Delete project')}
          </>
        }
      />
    </Specimen>
  ),
}

export const GuidelineNameTheActionDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Sample
        className="max-w-sm"
        title="Are you sure?"
        description="Please confirm."
        actions={
          <>
            {cancel}
            <Button size="sm">OK</Button>
          </>
        }
      />
    </Specimen>
  ),
}

/**
 * **Main action on the right**
 * Put the quiet Cancel on the left and the main button on the right, as in every other dialog. A moved
 * button makes people press the wrong one.
 */
export const GuidelineMainActionOnTheRightDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Sample
        className="max-w-sm"
        title="Leave project?"
        description="You will lose access to its files."
        actions={
          <>
            {cancel}
            {danger('Leave project')}
          </>
        }
      />
    </Specimen>
  ),
}

export const GuidelineMainActionOnTheRightDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Sample
        className="max-w-sm"
        title="Leave project?"
        description="You will lose access to its files."
        actions={
          <>
            {danger('Leave project')}
            {cancel}
          </>
        }
      />
    </Specimen>
  ),
}

/**
 * **Always offer a way out**
 * Give a Cancel button next to the main one. A dialog with only a destructive button traps the user.
 */
export const GuidelineAlwaysOfferAWayOutDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Sample
        className="max-w-sm"
        title="Delete file?"
        description="It will be removed for everyone."
        actions={
          <>
            {cancel}
            {danger('Delete file')}
          </>
        }
      />
    </Specimen>
  ),
}

export const GuidelineAlwaysOfferAWayOutDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Sample
        className="max-w-sm"
        title="Delete file?"
        description="It will be removed for everyone."
        actions={danger('Delete file')}
      />
    </Specimen>
  ),
}

const discard = (
  <>
    <Button tone="default" variant="outline" size="sm">
      Keep editing
    </Button>
    {danger('Discard')}
  </>
)

/**
 * **Always show an overlay**
 * Place the dialog on an overlay that dims the page and blocks it. Without one, the page stays active
 * and the dialog looks like part of it.
 */
export const GuidelineAlwaysShowAnOverlayDo: Story = {
  name: 'Guideline 4 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="flex w-full justify-center rounded-lg bg-surface-backdrop p-6">
        <Sample
          className="max-w-sm"
          title="Discard changes?"
          description="Your edits will be lost."
          actions={discard}
        />
      </div>
    </Specimen>
  ),
}

export const GuidelineAlwaysShowAnOverlayDont: Story = {
  name: 'Guideline 4 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Sample className="max-w-sm" title="Discard changes?" description="Your edits will be lost." actions={discard} />
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <GuidelinePairs
        rules={[
          [GuidelineNameTheActionDo, GuidelineNameTheActionDont],
          [GuidelineMainActionOnTheRightDo, GuidelineMainActionOnTheRightDont],
          [GuidelineAlwaysOfferAWayOutDo, GuidelineAlwaysOfferAWayOutDont],
          [GuidelineAlwaysShowAnOverlayDo, GuidelineAlwaysShowAnOverlayDont],
        ]}
      />
    </>
  )
}
