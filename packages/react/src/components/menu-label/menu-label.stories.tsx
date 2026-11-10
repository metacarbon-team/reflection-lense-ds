import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button/button'
import { Menu, MenuContent, MenuItem, MenuTrigger } from '../menu/menu'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '../select/select'
import { MenuLabel } from './menu-label'

const meta = {
  title: 'Components/MenuLabel',
  component: MenuLabel,
  args: { children: 'Group label' },
} satisfies Meta<typeof MenuLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  decorators: [
    (Story) => <div className="w-56 rounded-lg border border-neutral bg-card-neutral-emphasized p-1">{Story()}</div>,
  ],
}

/** The same component in both dropdowns; in a Select it goes inside a SelectGroup. */
export const InMenuAndSelect: Story = {
  decorators: [(Story) => <div className="flex gap-3">{Story()}</div>],
  render: () => (
    <>
      <Menu>
        <MenuTrigger asChild>
          <Button tone="default" variant="outline" size="sm">
            Menu
          </Button>
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>Actions</MenuLabel>
          <MenuItem>Rename</MenuItem>
          <MenuItem>Duplicate</MenuItem>
        </MenuContent>
      </Menu>
      <Select defaultValue="bold">
        <SelectTrigger appearance="button" aria-label="Text style">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <MenuLabel>Text style</MenuLabel>
            <SelectItem value="bold">Bold</SelectItem>
            <SelectItem value="italic">Italic</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </>
  ),
}
