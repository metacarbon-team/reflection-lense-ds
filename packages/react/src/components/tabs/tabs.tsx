import { cva } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { controlTransitionClass } from '../../lib/motion'

/**
 * The tabs root: owns the selected value. Radix Tabs; `defaultValue`, `value`, `onValueChange` work as in
 * Radix. Horizontal only: Figma has no vertical tabs, so `orientation="vertical"` is not styled. Tabs are
 * pages of content with panels; to pick one value from a few, such as a view mode, use Segmented Control.
 */
export const Tabs = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props} />
)

/** A tab: 40px, label text, an underline under the active one (Radix `data-state`). */
export const tabsTriggerVariants = cva(
  [
    'relative inline-flex h-10 shrink-0 items-center justify-center gap-1.5 px-3 whitespace-nowrap text-label text-neutral-subtle outline-none select-none',
    controlTransitionClass,
    'hover:bg-ghost-neutral-hover hover:text-neutral data-[state=active]:text-neutral',
    'focus-visible:rounded-xs focus-visible:text-neutral focus-visible:shadow-focus-ring',
    'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-lg after:bg-current',
    'after:opacity-0 data-[state=active]:after:opacity-100',
    // Radix sets `data-disabled` too, so a disabled tab rendered as a link (`asChild`) looks the same.
    'disabled:pointer-events-none disabled:text-disabled data-disabled:pointer-events-none data-disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      // Freezes hover or focus for docs and tests; in `default` the browser decides.
      state: {
        default: '',
        hover: 'bg-ghost-neutral-hover text-neutral',
        focus: 'rounded-xs text-neutral shadow-focus-ring',
      },
    },
    defaultVariants: { state: 'default' },
  },
)

/** The row of tabs. Name it with `aria-label`. */
export function TabsList({ className, ...props }: ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn('inline-flex items-center', className)} {...props} />
}

/** One tab. `value` links it to the `TabsContent` with the same value; `disabled` removes it from the tab order and blocks selection. */
export function TabsTrigger({
  className,
  state,
  ...props
}: ComponentProps<typeof TabsPrimitive.Trigger> & {
  /** Freezes `hover` or `focus` for docs and tests. The active tab comes from the selected value, not from here. */
  state?: 'default' | 'hover' | 'focus'
}) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ state }), className)}
      {...props}
    />
  )
}

/** The panel of the tab with the same `value`. Focusable, so a keyboard user can reach the content after the tabs. */
export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('outline-none focus-visible:rounded-md focus-visible:shadow-focus-ring', className)}
      {...props}
    />
  )
}
