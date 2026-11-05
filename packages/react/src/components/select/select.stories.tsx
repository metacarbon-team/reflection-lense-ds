import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from '../field/field'
import { MenuLabel } from '../menu-label/menu-label'
import { Select, SelectContent, SelectGroup, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from './select'

const meta = {
  title: 'Components/Select',
  component: Select,
  decorators: [(Story) => <div className="w-70">{Story()}</div>],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

const Options = () => (
  <SelectContent>
    <SelectGroup>
      <MenuLabel>Light</MenuLabel>
      <SelectItem value="reflection">Reflection</SelectItem>
      <SelectItem value="custom">Custom</SelectItem>
    </SelectGroup>
    <SelectSeparator />
    <SelectGroup>
      <MenuLabel>Dark</MenuLabel>
      <SelectItem value="reflection-dark">Reflection dark</SelectItem>
      <SelectItem value="archive" disabled>
        Archived theme
      </SelectItem>
    </SelectGroup>
  </SelectContent>
)

/** Select Input: the trigger in the control frame, in a Field. */
export const InField: Story = {
  render: (args) => (
    <Field label="Theme" caption="Applies to every page.">
      <Select {...args}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a theme" />
        </SelectTrigger>
        <Options />
      </Select>
    </Field>
  ),
}

export const Invalid: Story = {
  render: (args) => (
    <Field label="Theme" error="Choose a theme to continue.">
      <Select {...args}>
        <SelectTrigger>
          <SelectValue placeholder="Choose a theme" />
        </SelectTrigger>
        <Options />
      </Select>
    </Field>
  ),
}

export const Disabled: Story = {
  render: (args) => (
    <Field label="Theme" disabled>
      <Select {...args} defaultValue="reflection">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <Options />
      </Select>
    </Field>
  ),
}

/** Button trigger, for toolbars. */
export const ButtonTrigger: Story = {
  render: (args) => (
    <Select {...args} defaultValue="reflection">
      <SelectTrigger appearance="button" aria-label="Theme">
        <SelectValue />
      </SelectTrigger>
      <Options />
    </Select>
  ),
}
