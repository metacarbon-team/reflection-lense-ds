import { cva } from 'class-variance-authority'
import { DropdownMenu as DropdownMenuPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { CheckIcon, ChevronRightIcon } from '../../lib/icons'
import { menuItemVariants, menuSeparatorClass } from '../../lib/menu'

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

// The look of Checkbox, drawn from the row's `data-state` because the row is the control: a real
// Checkbox would put a second focusable control inside the menu item. Disabled has no shadow.
const checkboxBoxClass = [
  'inline-flex size-5 shrink-0 items-center justify-center rounded-md border shadow-sm',
  'border-neutral-emphasized bg-form-neutral',
  // Selection colors only while enabled, so the disabled look below always wins, as in Checkbox.
  'group-not-data-disabled/item:group-data-[state=checked]/item:border-transparent group-not-data-disabled/item:group-data-[state=checked]/item:bg-neutral-emphasized group-not-data-disabled/item:group-data-[state=checked]/item:text-neutral-on-emphasized',
  'group-not-data-disabled/item:group-data-[state=indeterminate]/item:bg-neutral group-not-data-disabled/item:group-data-[state=indeterminate]/item:text-neutral',
  'group-data-disabled/item:bg-disabled group-data-disabled/item:text-disabled group-data-disabled/item:shadow-none',
  'group-data-disabled/item:group-data-[state=unchecked]/item:border-disabled',
  'group-data-disabled/item:group-data-[state=checked]/item:border-transparent group-data-disabled/item:group-data-[state=indeterminate]/item:border-transparent',
]

const markProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.333,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

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
      className={cn(item(), 'group/item', className)}
      onSelect={(event) => {
        onSelect?.(event)
        if (!closeOnSelect) event.preventDefault()
      }}
      {...props}
    >
      <span data-slot="dropdown-menu-checkbox" className={cn(checkboxBoxClass)}>
        <DropdownMenuPrimitive.ItemIndicator className="flex items-center">
          <svg {...markProps} className="group-data-[state=indeterminate]/item:hidden">
            <path d="M2.667 8l3.333 3.333 7.333-7.333" />
          </svg>
          <svg {...markProps} className="hidden group-data-[state=indeterminate]/item:block">
            <path d="M2.667 8h10.667" />
          </svg>
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
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
      <DropdownMenuPrimitive.ItemIndicator className="ml-auto flex items-center">
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
      <ChevronRightIcon className="ml-auto text-neutral-subtle" />
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
