import { cva } from 'class-variance-authority'
import { Tooltip as TooltipPrimitive } from 'radix-ui'
import {
  createContext,
  useCallback,
  useContext,
  useRef,
  type ComponentProps,
  type ReactNode,
  type RefObject,
} from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'

/**
 * The bubble: 28px high, the emphasized card surface, one line of caption text. Width hugs the label
 * and the visible slots up to 200px; a longer label is cut with an ellipsis. `arrow` off hides the
 * pointer. The arrow is a rotated square that sits on the edge facing the trigger, picked by the
 * `data-side` of the bubble, so it follows Radix when the tooltip flips near the screen edge.
 */
const tooltipVariants = cva(
  [
    'group/tooltip relative z-50 flex h-7 w-max max-w-50 items-center gap-2 rounded-md px-3 py-1.5',
    'bg-card-neutral-emphasized text-caption text-neutral select-none',
    '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      arrow: {
        true: '',
        false: '[&>[data-slot=tooltip-arrow]]:hidden',
      },
    },
    defaultVariants: { arrow: true },
  },
)

const slotClass = 'flex shrink-0 items-center justify-center overflow-clip'

type TooltipOwnProps = {
  /** The hint text. A short noun or verb phrase on one line, not a sentence. */
  label: ReactNode
  /** Content before the label, 16 × 16: an icon. The tooltip shows the slot when it is set. */
  leadingSlot?: ReactNode
  /** Content after the label: a key chip, a badge or an icon. The tooltip shows the slot when it is set. */
  trailingSlot?: ReactNode
  /** Shows the arrow that points at the trigger. Turn it off when the tooltip floats with a gap. */
  arrow?: boolean
}

function TooltipParts({ label, leadingSlot, trailingSlot }: TooltipOwnProps) {
  return (
    <>
      {hasContent(leadingSlot) && (
        <span data-slot="tooltip-leading-slot" className={slotClass}>
          {leadingSlot}
        </span>
      )}
      <span data-slot="tooltip-label" className="min-w-0 flex-1 truncate">
        {label}
      </span>
      {hasContent(trailingSlot) && (
        <span data-slot="tooltip-trailing-slot" className={slotClass}>
          {trailingSlot}
        </span>
      )}
      <span
        data-slot="tooltip-arrow"
        aria-hidden="true"
        className={cn(
          'pointer-events-none absolute size-2 rotate-45 bg-card-neutral-emphasized',
          'group-data-[side=top]/tooltip:bottom-0 group-data-[side=top]/tooltip:left-1/2 group-data-[side=top]/tooltip:-translate-x-1/2 group-data-[side=top]/tooltip:translate-y-1/2',
          'group-data-[side=bottom]/tooltip:top-0 group-data-[side=bottom]/tooltip:left-1/2 group-data-[side=bottom]/tooltip:-translate-x-1/2 group-data-[side=bottom]/tooltip:-translate-y-1/2',
          'group-data-[side=left]/tooltip:right-0 group-data-[side=left]/tooltip:top-1/2 group-data-[side=left]/tooltip:-translate-y-1/2 group-data-[side=left]/tooltip:translate-x-1/2',
          'group-data-[side=right]/tooltip:left-0 group-data-[side=right]/tooltip:top-1/2 group-data-[side=right]/tooltip:-translate-y-1/2 group-data-[side=right]/tooltip:-translate-x-1/2',
        )}
      />
    </>
  )
}

/**
 * The tooltip always renders in the opposite color mode of its surroundings, with the same tokens as
 * everything else: it sets `data-mode` on itself to the swapped mode of the closest `data-mode` above
 * the anchor, and follows that mode when it changes.
 */
function swapMode(node: HTMLElement, anchor: Element | null) {
  const holder = anchor?.closest<HTMLElement>('[data-mode]') ?? document.documentElement
  const apply = () => {
    node.dataset.mode = holder.dataset.mode === 'dark' ? 'light' : 'dark'
  }
  apply()
  const observer = new MutationObserver(apply)
  observer.observe(holder, { attributes: true, attributeFilter: ['data-mode'] })
  return () => observer.disconnect()
}

const TriggerContext = createContext<RefObject<HTMLElement | null> | null>(null)

/** Provides the show delay shared by the tooltips below it. Put it once near the root of the app. */
export const TooltipProvider = ({
  delayDuration = 300,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
)

/** Tooltip: a short hint bubble for an element. Compose it from TooltipTrigger and TooltipContent. */
export const Tooltip = (props: ComponentProps<typeof TooltipPrimitive.Root>) => {
  const triggerRef = useRef<HTMLElement | null>(null)
  return (
    <TriggerContext value={triggerRef}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TriggerContext>
  )
}

/** The element the tooltip describes. It opens on hover and on keyboard focus. Use `asChild` to use your own element. */
export function TooltipTrigger(props: Omit<ComponentProps<typeof TooltipPrimitive.Trigger>, 'ref'>) {
  const triggerRef = useContext(TriggerContext)
  const ref = useCallback(
    (node: HTMLButtonElement | null) => {
      if (triggerRef) triggerRef.current = node
    },
    [triggerRef],
  )
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" ref={ref} {...props} />
}

export type TooltipContentProps = Omit<ComponentProps<typeof TooltipPrimitive.Content>, 'children' | 'ref'> &
  TooltipOwnProps

/**
 * The floating bubble. It opens on top of the trigger by default and moves to the opposite side when
 * there is no room. It is dark in a light interface and light in a dark one, with no separate colors.
 */
export function TooltipContent({
  label,
  leadingSlot,
  trailingSlot,
  arrow = true,
  side = 'top',
  sideOffset = 8,
  className,
  ...props
}: TooltipContentProps) {
  const triggerRef = useContext(TriggerContext)
  const ref = useCallback(
    (node: HTMLDivElement | null) => (node ? swapMode(node, triggerRef?.current ?? null) : undefined),
    [triggerRef],
  )
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        side={side}
        sideOffset={sideOffset}
        className={cn(tooltipVariants({ arrow }), className)}
        {...props}
      >
        <TooltipParts label={label} leadingSlot={leadingSlot} trailingSlot={trailingSlot} />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export type TooltipPanelProps = Omit<ComponentProps<'div'>, 'children'> &
  TooltipOwnProps & {
    /** The side of the trigger the bubble points from; it sets the arrow edge. */
    side?: 'top' | 'bottom' | 'left' | 'right'
  }

/**
 * The bubble without any behavior, drawn in the page: for docs and for showing the tooltip in a
 * layout. It swaps the color mode of its surroundings, like TooltipContent.
 */
export function TooltipPanel({
  label,
  leadingSlot,
  trailingSlot,
  arrow = true,
  side = 'top',
  className,
  ...props
}: TooltipPanelProps) {
  const ref = useCallback((node: HTMLDivElement | null) => (node ? swapMode(node, node.parentElement) : undefined), [])
  return (
    <div
      ref={ref}
      data-slot="tooltip-panel"
      data-side={side}
      className={cn(tooltipVariants({ arrow }), className)}
      {...props}
    >
      <TooltipParts label={label} leadingSlot={leadingSlot} trailingSlot={trailingSlot} />
    </div>
  )
}
