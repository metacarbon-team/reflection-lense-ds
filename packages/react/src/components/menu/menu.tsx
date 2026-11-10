import { cva } from 'class-variance-authority'
import { DropdownMenu as MenuPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { CheckIcon, ChevronRightIcon } from '../../lib/icons'
import { menuItemVariants, menuSeparatorClass } from '../../lib/menu'

// Context Menu: a list of actions opened from a trigger, with icons, shortcuts, checkable items,
// groups and submenus. Keyboard: arrows move, Enter or Space selects, Escape closes, typing jumps.

export const Menu = (props: ComponentProps<typeof MenuPrimitive.Root>) => (
  <MenuPrimitive.Root data-slot="menu" {...props} />
)

export const MenuTrigger = (props: ComponentProps<typeof MenuPrimitive.Trigger>) => (
  <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />
)

export const MenuGroup = (props: ComponentProps<typeof MenuPrimitive.Group>) => (
  <MenuPrimitive.Group data-slot="menu-group" {...props} />
)

export const MenuRadioGroup = (props: ComponentProps<typeof MenuPrimitive.RadioGroup>) => (
  <MenuPrimitive.RadioGroup data-slot="menu-radio-group" {...props} />
)

export const MenuSub = (props: ComponentProps<typeof MenuPrimitive.Sub>) => (
  <MenuPrimitive.Sub data-slot="menu-sub" {...props} />
)

// `content` is the main list and scrolls when the screen is short; `sub` is a submenu.
const menuSurfaceVariants = cva(
  'z-50 flex min-w-48 flex-col gap-0.5 overflow-hidden rounded-lg border border-neutral bg-card-neutral-emphasized p-1 text-neutral shadow-sm outline-none',
  {
    variants: {
      kind: {
        content: 'max-h-(--radix-dropdown-menu-content-available-height) overflow-y-auto',
        sub: '',
      },
    },
    defaultVariants: { kind: 'content' },
  },
)

export function MenuContent({
  className,
  sideOffset = 4,
  align = 'start',
  ...props
}: ComponentProps<typeof MenuPrimitive.Content>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Content
        data-slot="menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(menuSurfaceVariants({ kind: 'content' }), className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

export function MenuSubContent({ className, ...props }: ComponentProps<typeof MenuPrimitive.SubContent>) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.SubContent
        data-slot="menu-sub-content"
        className={cn(menuSurfaceVariants({ kind: 'sub' }), className)}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

// An open submenu keeps its trigger highlighted.
const item = () => menuItemVariants({ keepOpenHighlight: true })

/** An action: optional leading icon, label, optional MenuShortcut at the end. */
export function MenuItem({ className, ...props }: ComponentProps<typeof MenuPrimitive.Item>) {
  return <MenuPrimitive.Item data-slot="menu-item" className={cn(item(), className)} {...props} />
}

/** An item that toggles; the check sits at the end, like the checkable Select Menu. */
export function MenuCheckboxItem({ className, children, ...props }: ComponentProps<typeof MenuPrimitive.CheckboxItem>) {
  return (
    <MenuPrimitive.CheckboxItem data-slot="menu-checkbox-item" className={cn(item(), className)} {...props}>
      {children}
      <MenuPrimitive.ItemIndicator className="ml-auto flex items-center">
        <CheckIcon />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.CheckboxItem>
  )
}

export function MenuRadioItem({ className, children, ...props }: ComponentProps<typeof MenuPrimitive.RadioItem>) {
  return (
    <MenuPrimitive.RadioItem data-slot="menu-radio-item" className={cn(item(), className)} {...props}>
      {children}
      <MenuPrimitive.ItemIndicator className="ml-auto flex items-center">
        <CheckIcon />
      </MenuPrimitive.ItemIndicator>
    </MenuPrimitive.RadioItem>
  )
}

export function MenuSubTrigger({ className, children, ...props }: ComponentProps<typeof MenuPrimitive.SubTrigger>) {
  return (
    <MenuPrimitive.SubTrigger data-slot="menu-sub-trigger" className={cn(item(), className)} {...props}>
      {children}
      <ChevronRightIcon className="ml-auto text-neutral-subtle" />
    </MenuPrimitive.SubTrigger>
  )
}

export function MenuSeparator({ className, ...props }: ComponentProps<typeof MenuPrimitive.Separator>) {
  return <MenuPrimitive.Separator data-slot="menu-separator" className={cn(menuSeparatorClass, className)} {...props} />
}

/** Keyboard shortcut at the end of an item. */
export function MenuShortcut({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd data-slot="menu-shortcut" className={cn('ml-auto text-overline text-neutral-subtle', className)} {...props} />
  )
}
