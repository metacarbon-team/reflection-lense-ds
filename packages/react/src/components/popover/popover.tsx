import { cva } from 'class-variance-authority'
import { Popover as PopoverPrimitive } from 'radix-ui'
import { useId, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'

const popoverPanelVariants = cva(
  'flex w-72 flex-col gap-3 rounded-lg border border-neutral-subtle bg-card-neutral-emphasized p-3 text-neutral shadow-md',
)

const popoverHeaderVariants = cva('flex min-w-0 flex-col gap-0.5')

const popoverTitleVariants = cva('text-label text-neutral')

const popoverDescriptionVariants = cva('text-body-small text-neutral-subtle')

const popoverBodyVariants = cva('min-w-0')

const popoverContentVariants = cva('z-50 outline-none')

/** Popover: a small floating panel that opens from a trigger. Compose it from PopoverTrigger and PopoverContent. */
export const Popover = (props: ComponentProps<typeof PopoverPrimitive.Root>) => (
  <PopoverPrimitive.Root data-slot="popover" {...props} />
)

/** The control that opens the popover. Use `asChild` to make your own button the trigger. */
export const PopoverTrigger = (props: ComponentProps<typeof PopoverPrimitive.Trigger>) => (
  <PopoverPrimitive.Trigger data-slot="popover-trigger" {...props} />
)

/** Anchors the panel to another element instead of the trigger. */
export const PopoverAnchor = (props: ComponentProps<typeof PopoverPrimitive.Anchor>) => (
  <PopoverPrimitive.Anchor data-slot="popover-anchor" {...props} />
)

/** Closes the popover. Use `asChild` to make your own button the close control. */
export const PopoverClose = (props: ComponentProps<typeof PopoverPrimitive.Close>) => (
  <PopoverPrimitive.Close data-slot="popover-close" {...props} />
)

type PopoverPanelOwnProps = {
  /** Short name of the panel, two or three words. It says what the panel is for, not what kind of element it is. */
  label?: ReactNode
  /** One sentence of help under the title. Do not repeat the title in it. */
  description?: ReactNode
  /** Shows the title and description block. Turn it off when the trigger already names the panel. */
  header?: boolean
  /** Shows the content slot. Turn it off for an info-only popover that has just a title and a description. */
  content?: boolean
  /** The content slot: controls and short text, such as Checkbox rows, a field or a Button row. */
  children?: ReactNode
}

export type PopoverPanelProps = Omit<ComponentProps<'div'>, 'content' | 'children'> &
  PopoverPanelOwnProps & {
    /** Id of the title, so a dialog around the panel can be named by it. */
    labelId?: string
    /** Id of the description, so a dialog around the panel can be described by it. */
    descriptionId?: string
  }

/**
 * The panel surface without any behavior: the emphasized card surface with a subtle stroke and the
 * medium shadow, a 288px column holding the optional header and the content slot. PopoverContent
 * puts it in a portal; use it directly to show the panel in a page, as the docs do.
 */
export function PopoverPanel({
  label,
  description,
  header = true,
  content = true,
  children,
  labelId,
  descriptionId,
  className,
  ...props
}: PopoverPanelProps) {
  return (
    <div data-slot="popover-panel" className={cn(popoverPanelVariants(), className)} {...props}>
      {header && (
        <div data-slot="popover-header" className={popoverHeaderVariants()}>
          <p id={labelId} data-slot="popover-title" className={popoverTitleVariants()}>
            {label}
          </p>
          {description && (
            <p id={descriptionId} data-slot="popover-description" className={popoverDescriptionVariants()}>
              {description}
            </p>
          )}
        </div>
      )}
      {content && (
        <div data-slot="popover-body" className={popoverBodyVariants()}>
          {children}
        </div>
      )}
    </div>
  )
}

export type PopoverContentProps = Omit<ComponentProps<typeof PopoverPrimitive.Content>, 'content' | 'children'> &
  PopoverPanelOwnProps

/**
 * The floating panel: not modal, closes on Escape or a click outside, and opens right below its
 * trigger, aligned to its start. With a header the title names the dialog; without one, pass
 * `aria-label`.
 */
export function PopoverContent({
  label,
  description,
  header = true,
  content = true,
  children,
  className,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  ...props
}: PopoverContentProps) {
  const id = useId()
  const labelId = header && label ? `${id}-title` : undefined
  const descriptionId = header && description ? `${id}-description` : undefined
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        side={side}
        align={align}
        sideOffset={sideOffset}
        aria-labelledby={labelId}
        aria-describedby={descriptionId}
        className={popoverContentVariants()}
        {...props}
      >
        <PopoverPanel
          label={label}
          description={description}
          header={header}
          content={content}
          labelId={labelId}
          descriptionId={descriptionId}
          className={className}
        >
          {children}
        </PopoverPanel>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  )
}
