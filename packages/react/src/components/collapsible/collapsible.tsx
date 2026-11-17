import { Collapsible as CollapsiblePrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { ChevronDownIcon } from '../../lib/icons'

/**
 * The collapsible root: owns the open state. Radix Collapsible; `open`, `defaultOpen`, `onOpenChange`
 * and `disabled` work as in Radix. Put a `CollapsibleTrigger` and a `CollapsibleContent` inside.
 */
export const Collapsible = (props: ComponentProps<typeof CollapsiblePrimitive.Root>) => (
  <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
)

export type CollapsibleTriggerProps = Omit<ComponentProps<typeof CollapsiblePrimitive.Trigger>, 'asChild'> & {
  /** Freezes `hover` for docs and tests. Real hover needs no value. The `active` look of Figma (open) comes from `aria-expanded`, and `disabled` from the `disabled` prop, so neither is a value here. */
  state?: 'default' | 'hover'
  /** Content before the label, 16 × 16: usually an icon. The trigger shows the slot when it is set. */
  leadingSlot?: ReactNode
}

/**
 * Collapsible Trigger: the button that opens and closes the panel. A label, an optional leading slot
 * and a chevron that is always there: it points down when closed and up when open. Radix sets
 * `aria-expanded` and `aria-controls`; the open look reads from them. The label is the `children`.
 */
export function CollapsibleTrigger({
  className,
  state = 'default',
  leadingSlot,
  children,
  ...props
}: CollapsibleTriggerProps) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        'group/collapsible-trigger inline-flex items-center gap-1 rounded-xs py-0.5 text-body-xsmall-medium outline-none select-none',
        // Hover and open apply only while enabled, so an open disabled trigger still looks disabled.
        'text-neutral-subtle focus-visible:shadow-focus-ring',
        'not-disabled:not-data-disabled:hover:text-neutral not-disabled:not-data-disabled:aria-expanded:text-neutral',
        // `disabled` on the Trigger sets the native attribute; on the Root Radix sets `data-disabled`.
        'disabled:pointer-events-none disabled:text-disabled data-disabled:pointer-events-none data-disabled:text-disabled',
        '[&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
        state === 'hover' && 'text-neutral',
        className,
      )}
      {...props}
    >
      {hasContent(leadingSlot) && (
        <span data-slot="collapsible-leading-slot" className="flex shrink-0 items-center justify-center">
          {leadingSlot}
        </span>
      )}
      {children}
      <ChevronDownIcon data-slot="collapsible-chevron" className="group-aria-expanded/collapsible-trigger:rotate-180" />
    </CollapsiblePrimitive.Trigger>
  )
}

/** The panel the trigger shows and hides. Radix Collapsible Content: it is removed from the layout when closed. */
export const CollapsibleContent = ({ className, ...props }: ComponentProps<typeof CollapsiblePrimitive.Content>) => (
  <CollapsiblePrimitive.Content data-slot="collapsible-content" className={cn(className)} {...props} />
)
