import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { ChevronDownIcon } from '../../lib/icons'
import { Button } from '../button/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from './dropdown-menu'
import { MenuLabel } from '../menu-label/menu-label'

const meta = {
  title: 'Components/Dropdown Menu',
  component: DropdownMenu,
} satisfies Meta<typeof DropdownMenu>

export default meta
type Story = StoryObj<typeof meta>

const Copy = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
    <path d="M10.5 3.5v-.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h.5" />
  </svg>
)

/** Actions with shortcuts, a group, a submenu and a disabled item. */
export const Default: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button tone="default" variant="outline" size="sm">
          Actions
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          Copy <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Paste <DropdownMenuShortcut>⌘V</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem>
          Duplicate <DropdownMenuShortcut>⌘D</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Arrange</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem>Arrange in grid</DropdownMenuItem>
            <DropdownMenuItem>Stack horizontal</DropdownMenuItem>
            <DropdownMenuItem>Stack vertical</DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <DropdownMenu {...args}>
      <DropdownMenuTrigger asChild>
        <Button tone="default" variant="outline" size="sm">
          File
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Copy />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Copy />
            Copy link
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}

/**
 * Multi-select: checkbox items keep the menu open while you toggle them. A parent row is indeterminate
 * while only some of its items are selected.
 */
export const MultiSelect: Story = {
  render: function Render(args) {
    const teams = ['Design', 'Product', 'Engineering', 'Marketing']
    const [selected, setSelected] = useState<string[]>(['Design', 'Engineering'])
    const all = selected.length === teams.length ? true : selected.length === 0 ? false : 'indeterminate'
    const toggle = (team: string, on: boolean) =>
      setSelected((current) => (on ? [...current, team] : current.filter((t) => t !== team)))
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button tone="default" variant="outline" size="sm" trailingSlot={<ChevronDownIcon />}>
            Teams · {selected.length}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <MenuLabel>Filter by team</MenuLabel>
          <DropdownMenuCheckboxItem checked={all} onCheckedChange={(on) => setSelected(on ? teams : [])}>
            All teams
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          {teams.map((team) => (
            <DropdownMenuCheckboxItem
              key={team}
              checked={selected.includes(team)}
              onCheckedChange={(on) => toggle(team, on)}
            >
              {team}
            </DropdownMenuCheckboxItem>
          ))}
          <DropdownMenuCheckboxItem disabled checked>
            Archived
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}

/**
 * Choosing one value from a button, for toolbars: the button shows the current value, the list is a radio
 * group. In a form, use Select instead.
 */
export const ChooseValue: Story = {
  render: function Render(args) {
    const themes = { reflection: 'Reflection', custom: 'Custom', dark: 'Reflection dark' }
    const [theme, setTheme] = useState<keyof typeof themes>('reflection')
    return (
      <DropdownMenu {...args}>
        <DropdownMenuTrigger asChild>
          <Button tone="default" variant="outline" size="sm" trailingSlot={<ChevronDownIcon />}>
            {themes[theme]}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={theme} onValueChange={(value) => setTheme(value as keyof typeof themes)}>
            {Object.entries(themes).map(([value, label]) => (
              <DropdownMenuRadioItem key={value} value={value}>
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  },
}
