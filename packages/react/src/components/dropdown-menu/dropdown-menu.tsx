import { cva } from 'class-variance-authority'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { popupMotionClass } from '../../lib/motion'
import { CheckIcon, ChevronRightIcon } from '../../lib/icons'
import { menuItemVariants, menuSeparatorClass } from '../../lib/menu'
import { CheckboxBox } from '../checkbox/checkbox'

// Dropdown Menu: a list of actions or choices opened from a trigger, usually a Button through `asChild`.
// Icons, shortcuts, checkable and radio items, groups and submenus.
// Keyboard: arrows move, Enter or Space selects, Escape closes, typing jumps.

export const DropdownMenu = (props: ComponentProps<typeof DropdownMenuPrimitive.Root>) => (
  <DropdownMenuPrimitive.Root data-slot="dropdown-menu" {...props} />
)

export const DropdownMenuTrigger = (props: ComponentProps<typeof DropdownMenuPrimitive.Trigger>) => (
  <DropdownMenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
)

export const DropdownMenuGroup = (props: ComponentProps<typeof DropdownMenuPrimitive.Group>) => (
  <DropdownMenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
)

export const DropdownMenuRadioGroup = (props: ComponentProps<typeof DropdownMenuPrimitive.RadioGroup>) => (
  <DropdownMenuPrimitive.RadioGroup data-slot="dropdown-menu-radio-group" {...props} />
)

export const DropdownMenuSub = (props: ComponentProps<typeof DropdownMenuPrimitive.Sub>) => (
  <DropdownMenuPrimitive.Sub data-slot="dropdown-menu-sub" {...props} />
)

// `content` is the main list and scrolls when the screen is short; `sub` is a submenu.
const menuSurfaceVariants = cva(
  [
    'z-50 flex min-w-48 origin-(--radix-dropdown-menu-content-transform-origin) flex-col gap-0.5 overflow-hidden rounded-lg border border-neutral bg-card-neutral-emphasized p-1 text-neutral shadow-md outline-none',
    popupMotionClass,
  ],
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

export function DropdownMenuContent({
  className,
  sideOffset = 4,
  align = 'start',
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.Content>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        data-slot="dropdown-menu-content"
        sideOffset={sideOffset}
        align={align}
        className={cn(menuSurfaceVariants({ kind: 'content' }), className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

export function DropdownMenuSubContent({
  className,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubContent>) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        data-slot="dropdown-menu-sub-content"
        className={cn(menuSurfaceVariants({ kind: 'sub' }), className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

// An open submenu keeps its trigger highlighted.
const item = () => menuItemVariants({ keepOpenHighlight: true })

/** An action: optional leading icon, label, optional DropdownMenuShortcut at the end. */
export function DropdownMenuItem({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Item>) {
  return <DropdownMenuPrimitive.Item data-slot="dropdown-menu-item" className={cn(item(), className)} {...props} />
}

export type DropdownMenuCheckboxItemProps = ComponentProps<typeof DropdownMenuPrimitive.CheckboxItem> & {
  /** Close the menu when the item is toggled. Off by default, so several items can be toggled in a row. */
  closeOnSelect?: boolean
}

/**
 * Multi-select: a Checkbox at the start of the row, like Item Control `type=checkbox` in Figma. Toggling
 * keeps the menu open. `checked` takes `'indeterminate'` for a parent of partly selected items.
 */
export function DropdownMenuCheckboxItem({
  closeOnSelect = false,
  onSelect,
  className,
  children,
  ...props
}: DropdownMenuCheckboxItemProps) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      className={cn(item(), className)}
      onSelect={(event) => {
        onSelect?.(event)
        if (!closeOnSelect) event.preventDefault()
      }}
      {...props}
    >
      {/* The row is the checkbox (`menuitemcheckbox`): it draws the Checkbox box, not a second control. */}
      <CheckboxBox data-slot="dropdown-menu-checkbox" checked={props.checked} disabled={props.disabled} />
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  )
}

export function DropdownMenuRadioItem({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.RadioItem>) {
  return (
    <DropdownMenuPrimitive.RadioItem data-slot="dropdown-menu-radio-item" className={cn(item(), className)} {...props}>
      {children}
      <DropdownMenuPrimitive.ItemIndicator
        data-slot="dropdown-menu-radio-indicator"
        className="ml-auto flex items-center"
      >
        <CheckIcon />
      </DropdownMenuPrimitive.ItemIndicator>
    </DropdownMenuPrimitive.RadioItem>
  )
}

export function DropdownMenuSubTrigger({
  className,
  children,
  ...props
}: ComponentProps<typeof DropdownMenuPrimitive.SubTrigger>) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      data-slot="dropdown-menu-sub-trigger"
      className={cn(item(), className)}
      {...props}
    >
      {children}
      <ChevronRightIcon data-slot="dropdown-menu-sub-trigger-icon" className="ml-auto text-neutral-subtle" />
    </DropdownMenuPrimitive.SubTrigger>
  )
}

export function DropdownMenuSeparator({ className, ...props }: ComponentProps<typeof DropdownMenuPrimitive.Separator>) {
  return (
    <DropdownMenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(menuSeparatorClass, className)}
      {...props}
    />
  )
}

/** Keyboard shortcut at the end of an item. */
export function DropdownMenuShortcut({ className, ...props }: ComponentProps<'kbd'>) {
  return (
    <kbd
      data-slot="dropdown-menu-shortcut"
      className={cn('ml-auto text-overline text-neutral-subtle', className)}
      {...props}
    />
  )
}
