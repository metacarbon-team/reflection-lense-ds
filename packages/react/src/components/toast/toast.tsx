import { cva } from 'class-variance-authority'
import { Toast as ToastPrimitive } from 'radix-ui'
import { useCallback, useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CloseIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { IconButton } from '../icon-button/icon-button'

const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

const toastViewportVariants = cva('fixed right-4 bottom-4 z-50 flex w-100 max-w-full flex-col gap-3 outline-none')

const toastVariants = cva([
  'relative flex w-full min-w-0 items-center gap-3 rounded-xl border border-neutral-subtle bg-card-neutral-emphasized',
  'py-2.5 pr-2 pl-4 text-neutral shadow-md outline-none focus-visible:shadow-focus-ring',
])

const toastLeadingVariants = cva('flex shrink-0 items-center justify-center [&_svg]:size-5')

const toastContentVariants = cva('flex min-w-0 flex-1 flex-col')

const toastTitleVariants = cva('truncate text-body-small-medium text-neutral')

const toastDescriptionVariants = cva('truncate text-body-xsmall text-neutral-subtle')

// A card in the Toaster's pile. `data-expanded` and `data-front` come from the Toaster.
const toastLayerVariants = cva([
  'absolute inset-x-0 bottom-0 origin-bottom transition-all duration-300 ease-out motion-reduce:transition-none',
  'data-[swipe=move]:transition-none',
  // A folded pile shows the newest card; the cards behind keep only their edge.
  'data-[expanded=false]:data-[front=false]:pointer-events-none data-[expanded=false]:data-[front=false]:overflow-hidden',
  // `invisible` also takes the controls out of the tab order and the accessibility tree; the fade still plays.
  'data-[expanded=false]:data-[front=false]:*:invisible data-[expanded=false]:data-[front=false]:*:opacity-0',
  '*:transition-all *:duration-300 motion-reduce:*:transition-none',
])

const toasterVariants = cva('transition-all duration-300 ease-out motion-reduce:transition-none')

/**
 * Mounts the toast queue. `Toaster` already includes it; use it on its own only to place `Toast`s
 * by hand. `duration` (ms) sets how long a toast stays before it closes itself.
 */
export const ToastProvider = (props: ComponentProps<typeof ToastPrimitive.Provider>) => (
  <ToastPrimitive.Provider {...props} />
)

export type ToastViewportProps = ComponentProps<typeof ToastPrimitive.Viewport>

/**
 * Where toasts appear: a list pinned to the bottom right, 12px between cards. `Toaster` already
 * includes it and stacks its toasts; use it on its own to place `Toast`s by hand.
 */
export function ToastViewport({ className, ...props }: ToastViewportProps) {
  return (
    <ToastPrimitive.Viewport data-slot="toast-viewport" className={cn(toastViewportVariants(), className)} {...props} />
  )
}

export type ToastProps = Omit<ComponentProps<typeof ToastPrimitive.Root>, 'children' | 'title'> & {
  /** The message itself, a few words. One line, cut with an ellipsis when it does not fit. */
  label: ReactNode
  /** A second line of detail, such as a time or a name. The toast shows the line when it is set. */
  description?: ReactNode
  /** Content before the text, 20 × 20: usually a status icon. The toast shows the slot when it is set. */
  leadingSlot?: ReactNode
  /** One action, usually a `ToastAction` such as Undo or View. The toast shows it when it is set. */
  action?: ReactNode
  /** Accessible name of the close button. */
  closeLabel?: string
}

/**
 * Toast: a short, temporary message that confirms an action or reports a status without interrupting
 * the user. A card with a border and a medium shadow; it closes itself after `duration`, on the close
 * button and on a swipe. Most code opens toasts with `toast()` and a `Toaster`; use this component to
 * place one by hand inside a `ToastProvider` and a `ToastViewport`.
 */
export function Toast({
  className,
  label,
  description,
  leadingSlot,
  action,
  closeLabel = 'Close',
  ...props
}: ToastProps) {
  return (
    <ToastPrimitive.Root data-slot="toast" className={cn(toastVariants(), className)} {...props}>
      {hasContent(leadingSlot) && (
        <span data-slot="toast-leading" className={toastLeadingVariants()}>
          {leadingSlot}
        </span>
      )}
      <div data-slot="toast-content" className={toastContentVariants()}>
        <ToastPrimitive.Title data-slot="toast-title" className={toastTitleVariants()}>
          {label}
        </ToastPrimitive.Title>
        {hasContent(description) && (
          <ToastPrimitive.Description data-slot="toast-description" className={toastDescriptionVariants()}>
            {description}
          </ToastPrimitive.Description>
        )}
      </div>
      {hasContent(action) && action}
      <ToastPrimitive.Close asChild>
        <IconButton aria-label={closeLabel} variant="ghost" size="sm">
          <CloseIcon />
        </IconButton>
      </ToastPrimitive.Close>
    </ToastPrimitive.Root>
  )
}

/**
 * The toast's action: a small outline Button that also closes the toast. `altText` tells screen
 * reader users what the action does and how else to do it, because the toast may be gone by then.
 */
export function ToastAction({ className, children, ...props }: ComponentProps<typeof ToastPrimitive.Action>) {
  return (
    <ToastPrimitive.Action data-slot="toast-action" asChild {...props}>
      <Button tone="default" variant="outline" size="sm" className={cn('shrink-0', className)}>
        {children}
      </Button>
    </ToastPrimitive.Action>
  )
}

export type ToastOptions = {
  /** The message itself. See `Toast`. */
  label: ReactNode
  /** A second line of detail. */
  description?: ReactNode
  /** Content before the text, usually an icon. */
  leadingSlot?: ReactNode
  /** One action, such as Undo. `altText` says what it does for screen reader users; the toast closes on click. */
  action?: { label: ReactNode; altText: string; onClick?: () => void }
  /** How long the toast stays, in ms. Defaults to the `Toaster` duration. */
  duration?: number
  /** Accessible name of the close button. */
  closeLabel?: string
}

type ToastRecord = ToastOptions & { id: string; closing?: boolean }

/** How long a closing toast fades out before it leaves the list, in ms. */
const EXIT_MS = 300
// Geometry of the pile, in px. Cards are placed with inline styles because their offsets depend on the
// measured height of every toast; the look (borders, colors, radius, transitions) stays in classes.
const GAP = 12
const PEEK = 14
const SCALE = 0.05
const LAYERS = 3

let records: ToastRecord[] = []
let counter = 0
const listeners = new Set<() => void>()

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const getSnapshot = () => records
const update = (next: ToastRecord[]) => {
  records = next
  listeners.forEach((listener) => listener())
}

/**
 * Opens a toast in the `Toaster` and returns its id. Call it from anywhere, such as an event handler
 * or a data callback. `toast.dismiss(id)` closes one toast, `toast.dismiss()` closes all of them.
 */
export function toast(options: ToastOptions) {
  const id = String(++counter)
  update([...records, { ...options, id }])
  return id
}
toast.dismiss = (id?: string) => {
  const ids = id === undefined ? records.map((record) => record.id) : [id]
  update(records.map((record) => (ids.includes(record.id) ? { ...record, closing: true } : record)))
  setTimeout(() => update(records.filter((record) => !ids.includes(record.id))), EXIT_MS)
}

type ToasterItemProps = {
  record: ToastRecord
  /** 0 for the newest toast, 1 for the one behind it, and so on. */
  index: number
  /** Distance from the bottom edge when the pile is open: the heights of the newer toasts and the gaps. */
  offset: number
  expanded: boolean
  /** Natural height of this toast and of the newest one, in px; 0 until measured. */
  height: number
  frontHeight: number
  onHeight: (id: string, height: number) => void
}

function ToasterItem({ record, index, offset, expanded, height, frontHeight, onHeight }: ToasterItemProps) {
  const { id, action, closing, ...options } = record
  // A state, not a ref object: the card renders into the viewport and may appear after the first commit.
  const [element, setElement] = useState<HTMLLIElement | null>(null)
  const [mounted, setMounted] = useState(false)

  // The natural height: the card's padding and border plus its tallest part. It stays right while the
  // card is stretched or clipped to the front card in a folded pile.
  useLayoutEffect(() => {
    if (!element) return
    const measure = () => {
      const style = getComputedStyle(element)
      const chrome =
        parseFloat(style.paddingTop) +
        parseFloat(style.paddingBottom) +
        parseFloat(style.borderTopWidth) +
        parseFloat(style.borderBottomWidth)
      const parts = Array.from(element.children, (child) => (child as HTMLElement).offsetHeight)
      onHeight(id, chrome + Math.max(0, ...parts))
    }
    measure()
    const observer = new ResizeObserver(measure)
    Array.from(element.children).forEach((child) => observer.observe(child))
    return () => observer.disconnect()
  }, [id, element, onHeight])

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  const front = index === 0
  const folded = !expanded
  const lift = expanded ? -offset : -index * PEEK
  const scale = expanded ? 1 : 1 - index * SCALE
  const visible = mounted && !closing && !(folded && index >= LAYERS)

  return (
    <Toast
      ref={setElement}
      {...options}
      open
      onOpenChange={(open) => {
        if (!open) toast.dismiss(id)
      }}
      data-front={front}
      data-expanded={expanded}
      className={toastLayerVariants()}
      style={{
        transform: `translateY(${visible ? lift : lift + 24}px) scale(${scale})`,
        opacity: visible ? 1 : 0,
        // A folded pile gives every card the height of the front one, so the layers line up.
        height: (folded ? frontHeight : height) || undefined,
        // Follows the finger while swiping (Radix sets the variable) and flies out when released.
        translate: 'var(--radix-toast-swipe-move-x, var(--radix-toast-swipe-end-x, 0px)) 0',
      }}
      action={
        action && (
          <ToastAction altText={action.altText} onClick={action.onClick}>
            {action.label}
          </ToastAction>
        )
      }
    />
  )
}

export type ToasterProps = {
  /** Default time a toast stays, in ms. A toast's own `duration` wins. */
  duration?: number
  /** How many toasts show at once; the newest first. Older ones wait and return as newer ones close. */
  limit?: number
  /** Keeps the pile opened into a list instead of opening it on hover. */
  expand?: boolean
  /** Name of the notification region for screen reader users. `{hotkey}` stands for the key that focuses it (F8). */
  label?: string
  /** Classes for the viewport, to move or resize the list. */
  className?: string
}

/**
 * Toaster: mount it once near the app root, then open toasts with `toast()`. Toasts pile up with the
 * newest in front and the older ones peeking behind, smaller and lifted. The pile opens into a list on
 * hover or focus, and every move is animated. A toast closes by itself, on its close button, on its
 * action and on a swipe.
 */
export function Toaster({ duration = 5000, limit = 3, expand = false, label, className }: ToasterProps) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  const [heights, setHeights] = useState<Record<string, number>>({})
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const viewportRef = useRef<HTMLOListElement>(null)

  // Native listeners: toasts render into the viewport by a portal, so React's onFocus and onMouseEnter on
  // the viewport never see events from inside them. The pile opens on pointer entry and on focus.
  useEffect(() => {
    const element = viewportRef.current
    if (!element) return
    const enter = () => setHovered(true)
    const leave = () => setHovered(false)
    const focusIn = () => setFocused(true)
    const focusOut = (event: FocusEvent) => {
      if (!element.contains(event.relatedTarget as Node | null)) setFocused(false)
    }
    element.addEventListener('pointerenter', enter)
    element.addEventListener('pointerleave', leave)
    element.addEventListener('focusin', focusIn)
    element.addEventListener('focusout', focusOut)
    return () => {
      element.removeEventListener('pointerenter', enter)
      element.removeEventListener('pointerleave', leave)
      element.removeEventListener('focusin', focusIn)
      element.removeEventListener('focusout', focusOut)
    }
  }, [])

  const onHeight = useCallback(
    (id: string, height: number) =>
      setHeights((current) => (current[id] === height ? current : { ...current, [id]: height })),
    [],
  )

  const shown = all.slice(-limit)
  const heightOf = (id: string) => heights[id] ?? 0
  const expanded = expand || ((hovered || focused) && shown.length > 0)
  const newest = shown.at(-1)
  const frontHeight = newest ? heightOf(newest.id) : 0
  const listHeight = shown.reduce((sum, record) => sum + heightOf(record.id), 0) + GAP * Math.max(shown.length - 1, 0)

  return (
    <ToastProvider duration={duration}>
      {shown.map((record, position) => {
        const index = shown.length - 1 - position
        const offset = shown.slice(position + 1).reduce((sum, newer) => sum + heightOf(newer.id), 0) + GAP * index
        return (
          <ToasterItem
            key={record.id}
            record={record}
            index={index}
            offset={offset}
            expanded={expanded}
            height={heightOf(record.id)}
            frontHeight={frontHeight}
            onHeight={onHeight}
          />
        )
      })}
      <ToastViewport
        ref={viewportRef}
        label={label}
        className={cn(toasterVariants(), className)}
        style={{ height: expanded ? listHeight : frontHeight }}
      />
    </ToastProvider>
  )
}
