import { cva, type VariantProps } from 'class-variance-authority'
import { Tabs as TabsPrimitive } from 'radix-ui'
import { createContext, useContext, useLayoutEffect, useRef, useState, type ComponentProps } from 'react'
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
export const tabsListVariants = cva('relative inline-flex items-center', {
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
    'transition duration-150 ease-out-strong motion-reduce:transition-none',
    'hover:bg-ghost-neutral-hover hover:text-neutral data-[state=active]:text-neutral',
    'focus-visible:text-neutral focus-visible:shadow-focus-ring',
    'disabled:pointer-events-none disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      variant: {
        line: ['h-10 gap-1.5 px-3 text-label focus-visible:rounded-xs'],
        pill: ['gap-1 border border-transparent', 'focus-visible:bg-neutral-subtle'],
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

type Box = { x: number; y: number; width: number; height: number }

const sameBox = (a: Box | null, b: Box | null) =>
  a === b || (!!a && !!b && a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height)

/**
 * The moving mark under or behind the active tab: the line (an underline) or the pill (the filled
 * frame). It slides to the active trigger and resizes to it. The first placement does not animate.
 */
function TabsIndicator({ variant, size }: TabsStyle) {
  const self = useRef<HTMLSpanElement>(null)
  const [box, setBox] = useState<Box | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const list = self.current?.parentElement
    if (!list) return
    const watched = new Set<Element>()
    // Border box, so a change of padding or border moves the mark too.
    const resize = new ResizeObserver(() => measure())
    const measure = () => {
      const triggers = list.querySelectorAll<HTMLElement>('[data-slot=tabs-trigger]')
      // Tabs added later are watched too; removed ones drop out of the observer on their own.
      triggers.forEach((trigger) => {
        if (!watched.has(trigger)) {
          watched.add(trigger)
          resize.observe(trigger, { box: 'border-box' })
        }
      })
      const active = list.querySelector<HTMLElement>('[data-slot=tabs-trigger][data-state=active]')
      const next = active && {
        x: active.offsetLeft,
        y: active.offsetTop,
        width: active.offsetWidth,
        height: active.offsetHeight,
      }
      setBox((prev) => (sameBox(prev, next) ? prev : next))
    }
    measure()
    // A tab becoming active, and tabs coming or going.
    const mutations = new MutationObserver(measure)
    mutations.observe(list, { attributes: true, attributeFilter: ['data-state'], childList: true, subtree: true })
    resize.observe(list, { box: 'border-box' })
    // A web font that arrives after the first paint changes every tab's width.
    document.fonts?.addEventListener('loadingdone', measure)
    const frame = requestAnimationFrame(() => setReady(true))
    return () => {
      mutations.disconnect()
      resize.disconnect()
      document.fonts?.removeEventListener('loadingdone', measure)
      cancelAnimationFrame(frame)
    }
  }, [])

  // The line is the bottom 2px of the active trigger; the pill fills all of it.
  const line = variant === 'line'
  const height = box ? (line ? 2 : box.height) : 0
  const y = box ? (line ? box.y + box.height - 2 : box.y) : 0
  return (
    <span
      ref={self}
      data-slot="tabs-indicator"
      aria-hidden="true"
      className={cn(
        'pointer-events-none absolute top-0 left-0',
        // Nothing animates until the first placement is done; reduced motion never animates.
        ready ? 'transition-all duration-250 ease-out-strong motion-reduce:transition-none' : 'transition-none',
        line
          ? 'rounded-t-lg bg-current text-neutral'
          : cn('border border-neutral bg-neutral-subtle shadow-sm', size === 'lg' ? 'rounded-lg' : 'rounded-md'),
      )}
      style={{
        opacity: box ? 1 : 0,
        width: box?.width ?? 0,
        height,
        transform: `translate(${box?.x ?? 0}px, ${y}px)`,
      }}
    />
  )
}

export function TabsList({ className, variant = 'line', size = 'sm', children, ...props }: TabsListProps) {
  return (
    <TabsStyleContext value={{ variant, size }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={variant}
        className={cn(tabsListVariants({ variant }), className)}
        {...props}
      >
        <TabsIndicator variant={variant} size={size} />
        {children}
      </TabsPrimitive.List>
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
