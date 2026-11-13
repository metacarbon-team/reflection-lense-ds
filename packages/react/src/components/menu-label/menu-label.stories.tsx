import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '../button/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu'
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
export const InDropdownMenuAndSelect: Story = {
  decorators: [(Story) => <div className="flex items-center gap-3">{Story()}</div>],
  render: () => (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button tone="default" variant="outline" size="sm">
            Dropdown Menu
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <MenuLabel>Actions</MenuLabel>
          <DropdownMenuItem>Rename</DropdownMenuItem>
          <DropdownMenuItem>Duplicate</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Select defaultValue="bold">
        <SelectTrigger className="w-40" aria-label="Text style">
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
