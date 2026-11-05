import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Button } from '../button/button'
import {
  Menu,
  MenuCheckboxItem,
  MenuContent,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubContent,
  MenuSubTrigger,
  MenuTrigger,
} from './menu'
import { MenuLabel } from '../menu-label/menu-label'

const meta = {
  title: 'Components/Menu',
  component: Menu,
} satisfies Meta<typeof Menu>

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
    <Menu {...args}>
      <MenuTrigger asChild>
        <Button size="sm">Actions</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuItem>
          Copy <MenuShortcut>⌘C</MenuShortcut>
        </MenuItem>
        <MenuItem>
          Paste <MenuShortcut>⌘V</MenuShortcut>
        </MenuItem>
        <MenuItem>
          Duplicate <MenuShortcut>⌘D</MenuShortcut>
        </MenuItem>
        <MenuSeparator />
        <MenuSub>
          <MenuSubTrigger>Arrange</MenuSubTrigger>
          <MenuSubContent>
            <MenuItem>Arrange in grid</MenuItem>
            <MenuItem>Stack horizontal</MenuItem>
            <MenuItem>Stack vertical</MenuItem>
          </MenuSubContent>
        </MenuSub>
        <MenuSeparator />
        <MenuItem disabled>Delete</MenuItem>
      </MenuContent>
    </Menu>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <Menu {...args}>
      <MenuTrigger asChild>
        <Button size="sm">File</Button>
      </MenuTrigger>
      <MenuContent>
        <MenuGroup>
          <MenuItem>
            <Copy />
            Duplicate
          </MenuItem>
          <MenuItem>
            <Copy />
            Copy link
          </MenuItem>
        </MenuGroup>
      </MenuContent>
    </Menu>
  ),
}

/** Checkable items: toggles and a single choice, with section labels. */
export const Checkable: Story = {
  render: function Render(args) {
    const [bold, setBold] = useState(true)
    const [italic, setItalic] = useState(false)
    const [align, setAlign] = useState('left')
    return (
      <Menu {...args}>
        <MenuTrigger asChild>
          <Button size="sm">Format</Button>
        </MenuTrigger>
        <MenuContent>
          <MenuLabel>Text style</MenuLabel>
          <MenuCheckboxItem checked={bold} onCheckedChange={setBold}>
            Bold
          </MenuCheckboxItem>
          <MenuCheckboxItem checked={italic} onCheckedChange={setItalic}>
            Italic
          </MenuCheckboxItem>
          <MenuSeparator />
          <MenuLabel>Alignment</MenuLabel>
          <MenuRadioGroup value={align} onValueChange={setAlign}>
            <MenuRadioItem value="left">Left</MenuRadioItem>
            <MenuRadioItem value="center">Center</MenuRadioItem>
            <MenuRadioItem value="right">Right</MenuRadioItem>
          </MenuRadioGroup>
        </MenuContent>
      </Menu>
    )
  },
}
