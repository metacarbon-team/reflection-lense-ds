import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './switch'

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { 'aria-label': 'Notifications', disabled: false },
} satisfies Meta<typeof Switch>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const States: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Switch {...args} aria-label="Off" />
      <Switch {...args} aria-label="On" defaultChecked />
      <Switch {...args} aria-label="Off, disabled" disabled />
      <Switch {...args} aria-label="On, disabled" defaultChecked disabled />
    </div>
  ),
}

/** Named by a visible label. */
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="switch-notifications" />
      <label htmlFor="switch-notifications" className="text-body-small">
        Email notifications
      </label>
    </div>
  ),
}
