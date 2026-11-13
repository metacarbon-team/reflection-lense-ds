import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { createContext, useContext, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type TabsStyle = {
  variant: NonNullable<VariantProps<typeof tabsListVariants>['variant']>
  size: NonNullable<VariantProps<typeof tabsTriggerVariants>['size']>
}
const TabsStyleContext = createContext<TabsStyle>({ variant: 'line', size: 'sm' })

/**
 * The tabs root: owns the selected value. Radix Tabs; `defaultValue`, `value`, `onValueChange` work as in
 * Radix. Horizontal only: Figma has no vertical tabs, so `orientation="vertical"` is not styled.
 */
export const Tabs = ({ className, ...props }: ComponentProps<typeof TabsPrimitive.Root>) => (
  <TabsPrimitive.Root data-slot="tabs" className={cn('flex flex-col gap-2', className)} {...props} />
)

/**
 * `line`: tabs on the page with an underline under the active one, for navigation.
 * `pill`: a muted track with a raised active tab, for switching views of the same content.
 */
export const tabsListVariants = cva('inline-flex items-center', {
  variants: {
    variant: {
      line: '',
      pill: 'rounded-lg border border-neutral-subtle bg-neutral p-1',
    },
  },
  defaultVariants: { variant: 'line' },
})

/** Trigger styles per list variant; also for tab-like controls built on other semantics (radio groups). */
export const tabsTriggerVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center whitespace-nowrap text-neutral-subtle outline-none select-none',
    'hover:bg-ghost-neutral-hover hover:text-neutral data-[state=active]:text-neutral',
    'focus-visible:text-neutral focus-visible:shadow-focus-ring',
    // Radix sets `data-disabled` too, so a disabled tab rendered as a link (`asChild`) looks the same.
    'disabled:pointer-events-none disabled:text-disabled data-disabled:pointer-events-none data-disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        // The active tab is marked in CSS from Radix's `data-state`: an underline, or the raised pill.
        line: [
          'h-10 gap-1.5 px-3 text-label focus-visible:rounded-xs',
          'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-lg after:bg-current',
          'after:opacity-0 data-[state=active]:after:opacity-100',
        ],
        pill: [
          'gap-1 border border-transparent',
          // A disabled control has no shadow, active or not. Not `enabled:`, which matches only form controls.
          'data-[state=active]:border-neutral data-[state=active]:bg-neutral-subtle not-disabled:not-data-disabled:data-[state=active]:shadow-sm',
          'focus-visible:bg-neutral-subtle',
        ],
      },
      size: { sm: '', lg: '' },
      // Freezes hover or focus for docs and tests; in `default` the browser decides.
      state: {
        default: '',
        hover: 'bg-ghost-neutral-hover text-neutral',
        focus: 'text-neutral shadow-focus-ring',
      },
    },
    compoundVariants: [
      { variant: 'line', state: 'focus', className: 'rounded-xs' },
      { variant: 'pill', state: 'focus', className: 'bg-neutral-subtle' },
      { variant: 'pill', size: 'sm', className: 'h-6 rounded-md px-2 text-caption' },
      { variant: 'pill', size: 'lg', className: 'h-9 rounded-lg px-3 text-label' },
    ],
  },
)

export type TabsListProps = ComponentProps<typeof TabsPrimitive.List> & {
  /** `line` (default): an underline under the active tab. `pill`: a muted track with a raised active tab. */
  variant?: TabsStyle['variant']
  /** Pill tabs only: `sm` 24px, `lg` 36px. */
  size?: TabsStyle['size']
}

export function TabsList({ className, variant = 'line', size = 'sm', ...props }: TabsListProps) {
  return (
    <TabsStyleContext value={{ variant, size }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsStyleContext>
  )
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
  const style = useContext(TabsStyleContext)
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ ...style, state }), className)}
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
