import { Tooltip as TooltipPrimitive } from 'radix-ui'
import { useCallback, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { tooltipMotionClass } from '../../lib/motion'
import { ModeAnchor, modeAt, subscribeModes, useModeAnchorRef, usePortalMode } from '../../lib/portal-mode'
import { hasContent } from '../../lib/has-content'

/**
 * The bubble: at least 28px high, the emphasized card surface, caption text. Width hugs the label
 * and the visible slots up to 200px; a longer label wraps and the bubble grows in height.
 */
const tooltipClass = [
  'relative z-50 flex min-h-7 w-max max-w-50 items-center gap-2 rounded-md px-3 py-1.5',
  'bg-card-neutral-emphasized text-caption text-neutral select-none',
  '[&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
]

/** The arrow: a square of the bubble surface, turned 45° and centered on the edge that faces the trigger. */
const arrowClass = 'pointer-events-none block size-2 rotate-45 bg-card-neutral-emphasized'

const slotClass = 'flex shrink-0 items-center justify-center overflow-clip'

type TooltipOwnProps = {
  /** The hint text. A short noun or verb phrase, not a sentence; a longer label wraps. */
  label: ReactNode
  /** Content before the label, 16 × 16: an icon. The tooltip shows the slot when it is set. */
  leadingSlot?: ReactNode
  /** Content after the label: a key chip, a badge or an icon. The tooltip shows the slot when it is set. */
  trailingSlot?: ReactNode
  /** Shows the arrow that points at the trigger. Turn it off when the tooltip floats with a gap. */
  arrow?: boolean
}

function TooltipParts({ label, leadingSlot, trailingSlot }: Omit<TooltipOwnProps, 'arrow'>) {
  return (
    <>
      {hasContent(leadingSlot) && (
        <span data-slot="tooltip-leading-slot" className={slotClass}>
          {leadingSlot}
        </span>
      )}
      <span data-slot="tooltip-label" className="min-w-0 flex-1 wrap-break-word">
        {label}
      </span>
      {hasContent(trailingSlot) && (
        <span data-slot="tooltip-trailing-slot" className={slotClass}>
          {trailingSlot}
        </span>
      )}
    </>
  )
}

/** Provides the show delay shared by the tooltips below it. Put it once near the root of the app. */
export const TooltipProvider = ({
  delayDuration = 300,
  ...props
}: ComponentProps<typeof TooltipPrimitive.Provider>) => (
  <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />
)

/** Tooltip: a short hint bubble for an element. Compose it from TooltipTrigger and TooltipContent. */
export const Tooltip = (props: ComponentProps<typeof TooltipPrimitive.Root>) => (
  <ModeAnchor>
    <TooltipPrimitive.Root data-slot="tooltip" {...props} />
  </ModeAnchor>
)

/** The element the tooltip describes. It opens on hover and on keyboard focus. Use `asChild` to use your own element. */
export function TooltipTrigger({ ref, ...props }: ComponentProps<typeof TooltipPrimitive.Trigger>) {
  // The tooltip reads the trigger to pick its color mode.
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" ref={useModeAnchorRef(ref)} {...props} />
}

export type TooltipContentProps = Omit<ComponentProps<typeof TooltipPrimitive.Content>, 'children'> & TooltipOwnProps

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
  ref,
  ...props
}: TooltipContentProps) {
  // The bubble always takes the opposite color mode of the trigger's subtree, and follows it.
  const mode = usePortalMode(true)
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-mode={mode}
        data-slot="tooltip-content"
        side={side}
        sideOffset={sideOffset}
        className={cn(tooltipClass, tooltipMotionClass, 'origin-(--radix-tooltip-content-transform-origin)', className)}
        {...props}
      >
        <TooltipParts label={label} leadingSlot={leadingSlot} trailingSlot={trailingSlot} />
        {arrow && (
          // Radix puts the arrow on the edge that faces the trigger and keeps it over the trigger when the
          // bubble shifts at the screen edge. Its box is one square high; the square overlaps the bubble by half.
          <TooltipPrimitive.Arrow asChild width={8} height={8}>
            <span data-slot="tooltip-arrow" aria-hidden="true" className={cn(arrowClass, '-translate-y-1/2')} />
          </TooltipPrimitive.Arrow>
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

/** Where the panel's arrow sits for each side the bubble points from. */
const panelArrow = {
  top: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
  bottom: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2',
  left: 'top-1/2 right-0 translate-x-1/2 -translate-y-1/2',
  right: 'top-1/2 left-0 -translate-x-1/2 -translate-y-1/2',
} as const

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
  // Drawn in the page: the opposite of the mode around it, set on mount and followed.
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return undefined
    const apply = () => {
      const next = modeAt(node.parentElement, true)
      if (node.dataset.mode !== next) node.dataset.mode = next
    }
    apply()
    return subscribeModes(apply)
  }, [])
  return (
    <div ref={ref} data-slot="tooltip-panel" data-side={side} className={cn(tooltipClass, className)} {...props}>
      <TooltipParts label={label} leadingSlot={leadingSlot} trailingSlot={trailingSlot} />
      {arrow && (
        // No trigger to measure here: the arrow is centered on the edge that `side` faces.
        <span data-slot="tooltip-arrow" aria-hidden="true" className={cn(arrowClass, 'absolute', panelArrow[side])} />
      )}
    </div>
  )
}
