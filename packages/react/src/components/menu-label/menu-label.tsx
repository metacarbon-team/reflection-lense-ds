import { cva } from 'class-variance-authority'
import { DropdownMenu, Select } from 'radix-ui'
import { useContext, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { MenuSurfaceContext } from '../../lib/menu'

const menuLabelVariants = cva('px-3 pt-2 pb-1 text-caption text-neutral-subtle')

/**
 * Menu Label: the group label of every dropdown (Select, Menu). 12px at the sides like the menu
 * items (Item sm), 8px above and 4px below. Inside SelectContent it labels its SelectGroup for assistive tech.
 */
export function MenuLabel({ className, ...props }: ComponentProps<'div'>) {
  const surface = useContext(MenuSurfaceContext)
  const Label = surface === 'select' ? Select.Label : DropdownMenu.Label
  return <Label data-slot="menu-label" className={cn(menuLabelVariants(), className)} {...props} />
}
