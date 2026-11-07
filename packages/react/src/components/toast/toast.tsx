import { cva, type VariantProps } from 'class-variance-authority'
import { Toast as ToastPrimitive } from 'radix-ui'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { CloseIcon } from '../../lib/icons'
import { Button } from '../button/button'
import { IconButton } from '../icon-button/icon-button'

/**
 * Mounts the toast queue once, near the app root. Every `Toast` renders into the `ToastViewport` of
 * the closest provider. `duration` (ms) sets how long a toast stays before it closes itself.
 */
export const ToastProvider = (props: ComponentProps<typeof ToastPrimitive.Provider>) => (
  <ToastPrimitive.Provider {...props} />
)

/**
 * Where toasts appear: a list pinned to the bottom right. `expanded` lists every toast as a full card,
 * 12px apart. `stacked` collapses them into a pile: the newest card in front and two layers behind it,
 * older ones hidden. Hovering or focusing the pile expands it, and it collapses again on leave.
 */
export const toastViewportVariants = cva(
  'fixed right-4 bottom-4 z-50 flex w-100 max-w-full flex-col gap-3 outline-none',
  {
    variants: {
      state: {
        expanded: '',
        stacked: [
          'not-focus-within:not-hover:grid not-focus-within:not-hover:gap-0',
          'not-focus-within:not-hover:*:col-start-1 not-focus-within:not-hover:*:row-start-1',
          // Cards behind the newest keep only their top edge: the text is hidden, the card is moved up
          // by one layer (14px) and narrowed by the side inset.
          'not-focus-within:not-hover:[&>li:not(:last-child)>*]:invisible',
          'not-focus-within:not-hover:[&>li:nth-last-child(2)]:w-auto not-focus-within:not-hover:[&>li:nth-last-child(2)]:mx-2 not-focus-within:not-hover:[&>li:nth-last-child(2)]:-translate-y-3.5',
          'not-focus-within:not-hover:[&>li:nth-last-child(3)]:w-auto not-focus-within:not-hover:[&>li:nth-last-child(3)]:mx-5 not-focus-within:not-hover:[&>li:nth-last-child(3)]:-translate-y-7',
          'not-focus-within:not-hover:[&>li:nth-last-child(n+4)]:hidden',
        ],
      },
    },
    defaultVariants: { state: 'expanded' },
  },
)

export type ToastViewportProps = ComponentProps<typeof ToastPrimitive.Viewport> & {
  /** `expanded` is a list of full cards; `stacked` is a pile that opens on hover or focus. */
  state?: NonNullable<VariantProps<typeof toastViewportVariants>['state']>
}

/** Where toasts appear, pinned to the bottom right. Move it with `className`; `state` sets the layout. */
export function ToastViewport({ className, state, ...props }: ToastViewportProps) {
  return (
    <ToastPrimitive.Viewport
      data-slot="toast-viewport"
      data-stack={state ?? 'expanded'}
      className={cn(toastViewportVariants({ state }), className)}
      {...props}
    />
  )
}

/**
 * Toast surface: a card with a border and a medium shadow. `stacked` draws two narrower layers above
 * the card, as when more toasts wait behind it; leave about 28px of room above it. `default` and
 * `expanded` are the plain card. To show several toasts as a pile or as a list, set `state` on the
 * `ToastViewport`, which lays the real toasts out.
 */
export const toastVariants = cva(
  [
    'relative flex w-full min-w-0 items-center gap-3 rounded-xl border border-neutral-subtle bg-card-neutral-emphasized',
    'py-2.5 pr-2 pl-4 text-neutral shadow-md outline-none',
    'focus-visible:shadow-focus-ring',
  ],
  {
    variants: {
      state: {
        default: '',
        stacked: [
          'before:absolute before:inset-x-2 before:-top-3.5 before:h-3.5 before:rounded-t-xl before:border before:border-b-0',
          'before:border-neutral-subtle before:bg-card-neutral-emphasized',
          'after:absolute after:inset-x-5 after:-top-7 after:h-3.5 after:rounded-t-xl after:border after:border-b-0',
          'after:border-neutral-subtle after:bg-card-neutral-emphasized',
        ],
        expanded: '',
      },
    },
    defaultVariants: { state: 'default' },
  },
)

const hasContent = (node: ReactNode) => node !== undefined && node !== null && node !== false && node !== ''

export type ToastProps = Omit<ComponentProps<typeof ToastPrimitive.Root>, 'children' | 'title'> & {
  /** Stack layout: `stacked` shows two layers behind the card; `default` and `expanded` are a single card. */
  state?: NonNullable<VariantProps<typeof toastVariants>['state']>
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
 * the user. It closes itself after `duration`, on the close button and on a swipe. Render it inside a
 * `ToastProvider` with a `ToastViewport`.
 */
export function Toast({
  className,
  state,
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
      data-stack={state ?? 'default'}
      className={cn(toastVariants({ state }), className)}
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
