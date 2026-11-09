import { cva, type VariantProps } from 'class-variance-authority'
import { Toast as ToastPrimitive } from 'radix-ui'
import { useSyncExternalStore } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CloseIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { IconButton } from '../icon-button/icon-button'

const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

/**
 * Mounts the toast queue. `Toaster` already includes it; use it on its own only to place `Toast`s
 * by hand. `duration` (ms) sets how long a toast stays before it closes itself.
 */
export const ToastProvider = (props: ComponentProps<typeof ToastPrimitive.Provider>) => (
  <ToastPrimitive.Provider {...props} />
)

/**
 * Where toasts appear, pinned to the bottom right. Toasts pile up with the newest in front and two
 * layers behind it; hovering or focusing the pile opens it into a list, 12px between cards, and it
 * folds again on leave. `expand` keeps the list open.
 */
export const toastViewportVariants = cva(
  'fixed right-4 bottom-4 z-50 flex w-100 max-w-full flex-col gap-3 outline-none',
  {
    variants: {
      expand: {
        true: '',
        false: [
          'not-focus-within:not-hover:grid not-focus-within:not-hover:gap-0',
          'not-focus-within:not-hover:*:col-start-1 not-focus-within:not-hover:*:row-start-1',
          // Cards behind the newest keep only their top edge: the text is hidden, the card is moved up
          // by one layer (14px) and narrowed by the side inset.
          'not-focus-within:not-hover:[&>li:not(:last-child)>*]:invisible',
          'not-focus-within:not-hover:[&>li:nth-last-child(2)]:mx-2 not-focus-within:not-hover:[&>li:nth-last-child(2)]:w-auto not-focus-within:not-hover:[&>li:nth-last-child(2)]:-translate-y-3.5',
          'not-focus-within:not-hover:[&>li:nth-last-child(3)]:mx-5 not-focus-within:not-hover:[&>li:nth-last-child(3)]:w-auto not-focus-within:not-hover:[&>li:nth-last-child(3)]:-translate-y-7',
          'not-focus-within:not-hover:[&>li:nth-last-child(n+4)]:hidden',
        ],
      },
    },
    defaultVariants: { expand: false },
  },
)

export type ToastViewportProps = ComponentProps<typeof ToastPrimitive.Viewport> &
  VariantProps<typeof toastViewportVariants>

export function ToastViewport({ className, expand, ...props }: ToastViewportProps) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      className={cn(toastViewportVariants({ expand }), className)}
      {...props}
    />
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
    <ToastPrimitive.Root
      data-slot="toast"
      className={cn(
        'relative flex w-full min-w-0 items-center gap-3 rounded-xl border border-neutral-subtle bg-card-neutral-emphasized',
        'py-2.5 pr-2 pl-4 text-neutral shadow-md outline-none focus-visible:shadow-focus-ring',
        className,
      )}
      {...props}
    >
      {hasContent(leadingSlot) && (
        <span data-slot="toast-leading" className="flex shrink-0 items-center justify-center [&_svg]:size-5">
          {leadingSlot}
        </span>
      )}
      <div data-slot="toast-content" className="flex min-w-0 flex-1 flex-col">
        <ToastPrimitive.Title data-slot="toast-title" className="truncate text-body-small-medium text-neutral">
          {label}
        </ToastPrimitive.Title>
        {hasContent(description) && (
          <ToastPrimitive.Description
            data-slot="toast-description"
            className="truncate text-body-xsmall text-neutral-subtle"
          >
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
      <Button size="sm" className={cn('shrink-0', className)}>
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

type ToastRecord = ToastOptions & { id: string }

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
toast.dismiss = (id?: string) => update(id === undefined ? [] : records.filter((record) => record.id !== id))

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
 * Toaster: mount it once near the app root, then open toasts with `toast()`. New toasts pile up with
 * the newest in front, the pile opens into a list on hover or focus, and each toast closes by itself,
 * on its close button, on its action and on a swipe.
 */
export function Toaster({ duration = 5000, limit = 3, expand, label, className }: ToasterProps) {
  const all = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
  return (
    <ToastProvider duration={duration}>
      {all.slice(-limit).map(({ id, action, ...options }) => (
        <Toast
          key={id}
          {...options}
          action={
            action && (
              <ToastAction altText={action.altText} onClick={action.onClick}>
                {action.label}
              </ToastAction>
            )
          }
          onOpenChange={(open) => {
            if (!open) toast.dismiss(id)
          }}
        />
      ))}
      <ToastViewport expand={expand} label={label} className={className} />
    </ToastProvider>
  )
}
