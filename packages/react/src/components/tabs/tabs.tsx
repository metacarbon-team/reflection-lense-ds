import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { createContext, useContext, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'

type TabsStyle = Required<VariantProps<typeof tabsListVariants>> & { size: 'sm' | 'lg' }
const TabsStyleContext = createContext<TabsStyle>({ variant: 'line', size: 'sm' })

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
    'disabled:pointer-events-none disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        line: [
          'h-10 gap-1.5 px-3 text-label focus-visible:rounded-xs',
          'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-current',
          'after:opacity-0 data-[state=active]:after:opacity-100',
        ],
        pill: [
          'gap-1 border border-transparent',
          'data-[state=active]:border-neutral data-[state=active]:bg-neutral-subtle data-[state=active]:shadow-2xs',
          'focus-visible:bg-neutral-subtle',
        ],
      },
      size: { sm: '', lg: '' },
    },
    compoundVariants: [
      { variant: 'pill', size: 'sm', className: 'h-6 rounded-md px-2 text-caption' },
      { variant: 'pill', size: 'lg', className: 'h-9 rounded-lg px-3 text-label' },
    ],
  },
)

export type TabsListProps = ComponentProps<typeof TabsPrimitive.List> &
  VariantProps<typeof tabsListVariants> & {
    /** Pill tabs only: `sm` 24px, `lg` 36px. */
    size?: 'sm' | 'lg'
  }

export function TabsList({ className, variant = 'line', size = 'sm', ...props }: TabsListProps) {
  return (
    <TabsStyleContext value={{ variant: variant ?? 'line', size }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      />
    </TabsStyleContext>
  )
}

export function TabsTrigger({ className, ...props }: ComponentProps<typeof TabsPrimitive.Trigger>) {
  const style = useContext(TabsStyleContext)
  return (
    <TabsPrimitive.Trigger data-slot="tabs-trigger" className={cn(tabsTriggerVariants(style), className)} {...props} />
  )
}

export function TabsContent({ className, ...props }: ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn('outline-none focus-visible:rounded-md focus-visible:shadow-focus-ring', className)}
      {...props}
    />
  )
}
