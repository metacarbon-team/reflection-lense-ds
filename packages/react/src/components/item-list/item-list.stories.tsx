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

/** Wrap the list in a `RadioGroup` with `asChild`. A click anywhere on a row selects its radio. */
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
            htmlFor="delivery-standard"
            leadingSlot={<Radio id="delivery-standard" value="standard" />}
          />
          <Item
            size="lg"
            label="Express delivery"
            description="Next day."
            metaLabel="$9"
            htmlFor="delivery-express"
            leadingSlot={<Radio id="delivery-express" value="express" />}
          />
          <Item
            size="lg"
            label="Same-day delivery"
            description="Within 4 hours."
            metaLabel="$19"
            htmlFor="delivery-same-day"
            leadingSlot={<Radio id="delivery-same-day" value="same-day" />}
          />
        </ItemList>
      </RadioGroup>
    </Frame>
  ),
}

/** Switches in the trailing slot, with a divider between the rows. A click anywhere on a row flips its switch. */
export const Settings: Story = {
  render: (args) => (
    <Frame>
      <ItemList {...args}>
        <Item
          size="lg"
          label="Email notifications"
          description="Product news and receipts."
          htmlFor="settings-email"
          trailingSlot={<Switch id="settings-email" defaultChecked />}
          divider
        />
        <Item
          size="lg"
          label="Push notifications"
          description="Replies and mentions."
          htmlFor="settings-push"
          trailingSlot={<Switch id="settings-push" />}
          divider
        />
        <Item
          size="lg"
          label="Weekly digest"
          description="A summary every Monday."
          htmlFor="settings-digest"
          trailingSlot={<Switch id="settings-digest" />}
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
