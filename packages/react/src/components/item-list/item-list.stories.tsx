import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { ChevronRightIcon } from '../../lib/icons'
import { Item } from '../item'
import { Radio, RadioGroup } from '../radio'
import { Switch } from '../switch'
import { ItemList } from './item-list'

const rows = (
  <>
    <Item size="lg" label="Title" description="Description" trailingSlot={<ChevronRightIcon />} />
    <Item size="lg" label="Title" description="Description" trailingSlot={<ChevronRightIcon />} />
    <Item size="lg" label="Title" description="Description" trailingSlot={<ChevronRightIcon />} />
  </>
)

/** The list fills its parent, so the stories give it the 320 px of the Figma specimens. */
const Frame = ({ children }: { children: ReactNode }) => <div className="w-80">{children}</div>

const meta = {
  title: 'Components/ItemList',
  component: ItemList,
  args: { variant: 'card', children: rows },
  argTypes: {
    variant: { control: 'inline-radio', options: ['plain', 'card'] },
    children: { control: false },
  },
} satisfies Meta<typeof ItemList>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: (args) => (
    <Frame>
      <ItemList {...args} />
    </Frame>
  ),
}

/** Plain on the background it sits on, and card on its own surface. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_20rem] items-start gap-x-3 gap-y-6">
      {(['plain', 'card'] as const).map((variant) => (
        <div key={variant} className="contents">
          <span className="pt-3 text-caption text-neutral-subtle">{variant}</span>
          <ItemList {...args} variant={variant} />
        </div>
      ))}
    </div>
  ),
}

/** Wrap the list in a `RadioGroup` with `asChild`: arrow keys move the selection between the rows. */
export const DeliveryMethod: Story = {
  render: (args) => (
    <Frame>
      <RadioGroup asChild defaultValue="standard" aria-label="Delivery method" className="gap-0">
        <ItemList {...args}>
          <Item
            size="lg"
            label="Standard delivery"
            description="3 to 5 days."
            metaLabel="Free"
            leadingSlot={<Radio value="standard" aria-label="Standard delivery" />}
          />
          <Item
            size="lg"
            label="Express delivery"
            description="Next day."
            metaLabel="$9"
            leadingSlot={<Radio value="express" aria-label="Express delivery" />}
          />
          <Item
            size="lg"
            label="Same-day delivery"
            description="Within 4 hours."
            metaLabel="$19"
            leadingSlot={<Radio value="same-day" aria-label="Same-day delivery" />}
          />
        </ItemList>
      </RadioGroup>
    </Frame>
  ),
}

/** Switches in the trailing slot, with a divider between the rows. */
export const Settings: Story = {
  render: (args) => (
    <Frame>
      <ItemList {...args}>
        <Item
          size="lg"
          label="Email notifications"
          description="Product news and receipts."
          trailingSlot={<Switch aria-label="Email notifications" defaultChecked />}
          divider
        />
        <Item
          size="lg"
          label="Push notifications"
          description="Replies and mentions."
          trailingSlot={<Switch aria-label="Push notifications" />}
          divider
        />
        <Item
          size="lg"
          label="Weekly digest"
          description="A summary every Monday."
          trailingSlot={<Switch aria-label="Weekly digest" />}
        />
      </ItemList>
    </Frame>
  ),
}

/** The current row is `active`; a row that cannot be opened is `disabled`. */
export const Navigation: Story = {
  render: (args) => (
    <Frame>
      <ItemList {...args}>
        <Item size="md" label="Overview" state="active" trailingSlot={<ChevronRightIcon />} />
        <Item size="md" label="Members" metaLabel="12" trailingSlot={<ChevronRightIcon />} />
        <Item size="md" label="Billing" trailingSlot={<ChevronRightIcon />} />
        <Item size="md" label="Audit log" disabled trailingSlot={<ChevronRightIcon />} />
      </ItemList>
    </Frame>
  ),
}
