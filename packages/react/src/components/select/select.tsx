import { cva, type VariantProps } from 'class-variance-authority'
import { Select as SelectPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { controlFrameClass } from '../../lib/control-frame'
import { CheckIcon, ChevronDownIcon } from '../../lib/icons'
import { menuItemVariants, menuSeparatorClass, MenuSurfaceContext } from '../../lib/menu'
import { buttonVariants } from '../button/button'
import { useFieldControl } from '../field/field'

/**
 * The trigger. `input` is the control frame of Input, for forms: open shows the focus ring, as the open
 * Select Input does in Figma. `button` is a small outline Button, for toolbars: open shows the pressed
 * fill, like every popup trigger built on Button.
 */
const selectTriggerVariants = cva(
  [
    'outline-none focus-visible:shadow-focus-ring',
    'data-placeholder:text-neutral-subtle *:data-[slot=select-value]:truncate',
    '[&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      appearance: {
        input: [
          controlFrameClass,
          'flex h-8 w-full min-w-0 items-center justify-between gap-1.5 px-3 text-left data-[state=open]:shadow-focus-ring',
        ],
        button: buttonVariants({ tone: 'default', variant: 'outline', size: 'sm' }),
      },
    },
    defaultVariants: { appearance: 'input' },
  },
)

const selectIconVariants = cva('', {
  variants: { appearance: { input: 'text-neutral-subtle', button: '' } },
  defaultVariants: { appearance: 'input' },
})

export const Select = (props: ComponentProps<typeof SelectPrimitive.Root>) => (
  <SelectPrimitive.Root data-slot="select" {...props} />
)

export const SelectGroup = (props: ComponentProps<typeof SelectPrimitive.Group>) => (
  <SelectPrimitive.Group data-slot="select-group" {...props} />
)

export const SelectValue = (props: ComponentProps<typeof SelectPrimitive.Value>) => (
  <SelectPrimitive.Value data-slot="select-value" {...props} />
)

export type SelectTriggerProps = ComponentProps<typeof SelectPrimitive.Trigger> & {
  /** `input`: the control frame of Input, for forms. `button`: a small outline button, for toolbars. */
  appearance?: VariantProps<typeof selectTriggerVariants>['appearance']
}

/** The control that opens the menu; open shows the focus ring. Takes id and state from a Field. */
export function SelectTrigger({ appearance = 'input', className, children, ...props }: SelectTriggerProps) {
  const control = useFieldControl(props)
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-invalid={control.invalid || undefined}
      {...props}
      {...control.attributes}
      className={cn(selectTriggerVariants({ appearance }), className)}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className={selectIconVariants({ appearance }) || undefined} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

/** Select Menu: the list of options under the trigger, at least as wide as the trigger. */
export function SelectContent({
  className,
  children,
  position = 'popper',
  sideOffset = 4,
  ...props
}: ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        position={position}
        sideOffset={sideOffset}
        className={cn(
          'relative z-50 max-h-(--radix-select-content-available-height) min-w-(--radix-select-trigger-width) overflow-hidden rounded-lg border border-neutral bg-card-neutral-emphasized text-neutral shadow-md',
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport className="flex flex-col gap-0.5 p-1">
          <MenuSurfaceContext value="select">{children}</MenuSurfaceContext>
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

/** One option, an Item sm: label on the left, a check on the right when selected. */
export function SelectItem({ className, children, ...props }: ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item data-slot="select-item" className={cn(menuItemVariants(), className)} {...props}>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="ml-auto flex items-center">
        <CheckIcon />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

export function SelectSeparator({ className, ...props }: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator data-slot="select-separator" className={cn(menuSeparatorClass, className)} {...props} />
  )
}
