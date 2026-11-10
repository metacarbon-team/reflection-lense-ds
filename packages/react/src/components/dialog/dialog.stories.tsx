import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button/button'
import { Field } from '../field/field'
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

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
} satisfies Meta<typeof Dialog>

export default meta
type Story = StoryObj<typeof meta>

/** Inline actions at the end of the footer. */
export const Inline: Story = {
  render: (args) => (
    <Dialog {...args}>
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
          <DialogClose asChild>
            <Button tone="default" variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
          <Button size="sm" variant="solid" tone="accent">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

/** Stacked: full-width actions, the primary one first. No close button. */
export const Stacked: Story = {
  render: (args) => (
    <Dialog {...args}>
      <DialogTrigger asChild>
        <Button variant="outline" tone="danger">
          Delete theme
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete Reflection copy?</DialogTitle>
          <DialogDescription>The theme is removed from this browser.</DialogDescription>
        </DialogHeader>
        <DialogFooter layout="stacked">
          <Button size="sm" variant="solid" tone="danger">
            Delete
          </Button>
          <DialogClose asChild>
            <Button tone="default" variant="outline" size="sm">
              Cancel
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}
