import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Button } from '../button/button'
import { Checkbox } from '../checkbox/checkbox'
import { Popover, PopoverClose, PopoverContent, PopoverPanel, PopoverTrigger } from './popover'

const meta = {
  title: 'Components/Popover',
  component: PopoverContent,
  args: {
    label: 'Dimensions',
    description: 'Set the dimensions for the layer.',
    header: true,
    content: true,
  },
  argTypes: {
    label: { control: 'text' },
    description: { control: 'text' },
    header: { control: 'boolean' },
    content: { control: 'boolean' },
  },
} satisfies Meta<typeof PopoverContent>

export default meta
type Story = StoryObj<typeof meta>

/** Two rows of checkboxes, as in a filter panel. */
const Rows = ({ prefix }: { prefix: string }) => (
  <div className="flex flex-col gap-2">
    {['Only my layers', 'Include hidden'].map((name) => (
      <div key={name} className="flex items-center gap-2">
        <Checkbox id={`${prefix}-${name}`} />
        <label htmlFor={`${prefix}-${name}`} className="text-body-small">
          {name}
        </label>
      </div>
    ))}
  </div>
)

const Plain = ({ children }: { children: ReactNode }) => <div className="p-8">{children}</div>

/** Open in the canvas; in Docs it opens on click, so the panel does not cover the page. */
export const Playground: Story = {
  render: (args, { viewMode }) => (
    <Plain>
      <Popover defaultOpen={viewMode !== 'docs'}>
        <PopoverTrigger asChild>
          <Button>Layer size</Button>
        </PopoverTrigger>
        <PopoverContent {...args} aria-label={args.header ? undefined : 'Layer size'}>
          <Rows prefix="playground" />
        </PopoverContent>
      </Popover>
    </Plain>
  ),
}

/** The panel for each `header` and `content` combination, drawn in the page in the current theme. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(2,max-content)] items-start gap-x-6 gap-y-4">
      <span />
      <span className="text-caption text-neutral-subtle">content: true</span>
      <span className="text-caption text-neutral-subtle">content: false</span>
      <span className="text-caption text-neutral-subtle">header: true</span>
      <PopoverPanel label={args.label} description={args.description}>
        <Rows prefix="variants-a" />
      </PopoverPanel>
      <PopoverPanel label={args.label} description={args.description} content={false} />
      <span className="text-caption text-neutral-subtle">header: false</span>
      <PopoverPanel header={false}>
        <Rows prefix="variants-b" />
      </PopoverPanel>
      <span />
    </div>
  ),
}

/** Controls in the content slot, with a button row that closes the popover. */
export const WithControls: Story = {
  render: (args) => (
    <Plain>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Filters</Button>
        </PopoverTrigger>
        <PopoverContent {...args} label="Layer filters" description="Choose which layers the list shows.">
          <div className="flex flex-col gap-3">
            <Rows prefix="controls" />
            <div className="flex justify-end gap-2">
              <PopoverClose asChild>
                <Button size="sm">Cancel</Button>
              </PopoverClose>
              <PopoverClose asChild>
                <Button size="sm" variant="solid" tone="accent">
                  Apply
                </Button>
              </PopoverClose>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </Plain>
  ),
}

/** Only a title and a description: turn the content slot off. */
export const InfoOnly: Story = {
  render: (args) => (
    <Plain>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Layer info</Button>
        </PopoverTrigger>
        <PopoverContent {...args} content={false} label="Layer info" description="Created by you, edited today." />
      </Popover>
    </Plain>
  ),
}

/** The trigger already names the panel, so the header is off. Name the dialog with `aria-label`. */
export const WithoutHeader: Story = {
  render: (args) => (
    <Plain>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Filters</Button>
        </PopoverTrigger>
        <PopoverContent {...args} header={false} aria-label="Filters">
          <Rows prefix="no-header" />
        </PopoverContent>
      </Popover>
    </Plain>
  ),
}
