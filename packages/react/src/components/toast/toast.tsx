import type { ComponentProps, CSSProperties, ReactNode } from 'react'
import { Toaster as SonnerToaster, toast as sonnerToast, type ExternalToast } from 'sonner'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { CloseIcon } from '../../lib/icons'
import { buttonVariants } from '../button/button'
import { iconButtonVariants } from '../icon-button/icon-button'

// The toast queue, stacking, timers, swipe and enter/exit motion come from sonner; the look is ours,
// given through its unstyled mode. Sonner's own layout rules use zero specificity, so these classes win.

/** The card: a border, the medium shadow, the leading slot, the text, the action and the close button in one row. */
const toastClass =
  'flex w-full min-w-0 items-center gap-3 rounded-xl border border-neutral-subtle bg-card-neutral-emphasized py-2.5 pr-2 pl-4 text-neutral shadow-md outline-none focus-visible:shadow-focus-ring'
const leadingClass = 'm-0 flex size-5 shrink-0 items-center justify-center [&_svg:not([class*=size-])]:size-5'
const contentClass = 'flex min-w-0 flex-1 flex-col'
const titleClass = 'truncate text-body-small-medium text-neutral'
const descriptionClass = 'truncate text-body-xsmall text-neutral-subtle'
const actionClass = cn(buttonVariants({ tone: 'default', variant: 'outline', size: 'sm' }), 'shrink-0')
// Sonner puts the close button first and pins it to a corner; here it sits at the end of the row.
const closeClass = cn(
  iconButtonVariants({ tone: 'default', variant: 'ghost', size: 'sm' }),
  'static order-last shrink-0 translate-x-0 translate-y-0',
)

// The status glyphs of `toast.success()` and the others, 20 × 20, in the color of their role.
const StatusGlyph = ({ className, children }: { className: string; children: ReactNode }) => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {children}
  </svg>
)

const statusIcons = {
  success: (
    <StatusGlyph className="text-success">
      <circle cx="10" cy="10" r="7.25" />
      <path d="M6.5 10.5l2.5 2.5 4.5-5" />
    </StatusGlyph>
  ),
  info: (
    <StatusGlyph className="text-info">
      <circle cx="10" cy="10" r="7.25" />
      <path d="M10 9v4.5M10 6.5v.01" />
    </StatusGlyph>
  ),
  warning: (
    <StatusGlyph className="text-warning">
      <path d="M10 3.5l7 12.5H3L10 3.5zM10 8.5v3.5M10 14v.01" />
    </StatusGlyph>
  ),
  error: (
    <StatusGlyph className="text-danger">
      <circle cx="10" cy="10" r="7.25" />
      <path d="M7.5 7.5l5 5M12.5 7.5l-5 5" />
    </StatusGlyph>
  ),
  loading: (
    <StatusGlyph className="animate-spin text-neutral-subtle motion-reduce:animate-none">
      <path d="M10 2.75a7.25 7.25 0 107.25 7.25" />
    </StatusGlyph>
  ),
  close: <CloseIcon />,
}

export type ToastOptions = {
  /** The message itself, a few words. One line, cut with an ellipsis when it does not fit. */
  label: ReactNode
  /** A second line of detail, such as a time or a name. Shown when it is set. */
  description?: ReactNode
  /** Content before the text, 20 × 20: usually an icon. The status shortcuts set their own icon. */
  leadingSlot?: ReactNode
  /** One action, such as Undo or View: a small outline Button. The toast closes after it runs. */
  action?: { label: ReactNode; onClick?: () => void }
  /** How long the toast stays, in ms. Defaults to the `Toaster` duration; `Infinity` keeps it open. */
  duration?: number
  /** Pass the id of an open toast to update it in place instead of opening a new one. */
  id?: string | number
}

const toSonner = ({
  label,
  description,
  leadingSlot,
  action,
  duration,
  id,
}: ToastOptions): [ReactNode, ExternalToast] => [
  label,
  {
    description,
    icon: leadingSlot,
    action: action && { label: action.label, onClick: () => action.onClick?.() },
    duration,
    id,
  },
]

/**
 * Opens a toast in the `Toaster` and returns its id. Call it from anywhere, such as an event handler or a
 * data callback. The status shortcuts add their icon: `toast.success()`, `toast.info()`,
 * `toast.warning()`, `toast.error()`, and `toast.loading()` with a spinner that stays until you update
 * or dismiss it. `toast.promise()` shows loading, then success or error. `toast.dismiss(id)` closes one
 * toast, `toast.dismiss()` all of them.
 */
export function toast(options: ToastOptions) {
  return sonnerToast(...toSonner(options))
}
toast.success = (options: ToastOptions) => sonnerToast.success(...toSonner(options))
toast.info = (options: ToastOptions) => sonnerToast.info(...toSonner(options))
toast.warning = (options: ToastOptions) => sonnerToast.warning(...toSonner(options))
toast.error = (options: ToastOptions) => sonnerToast.error(...toSonner(options))
toast.loading = (options: ToastOptions) => sonnerToast.loading(...toSonner(options))
/**
 * A loading toast that turns into success or error when the promise settles. Each message is the
 * label; `success` and `error` can be functions of the result or the error.
 */
toast.promise = <T,>(
  promise: Promise<T> | (() => Promise<T>),
  messages: {
    loading: ReactNode
    success: ReactNode | ((data: T) => ReactNode)
    error: ReactNode | ((error: unknown) => ReactNode)
  },
) => sonnerToast.promise(promise, messages)
toast.dismiss = (id?: string | number) => sonnerToast.dismiss(id)

export type ToasterProps = {
  /** Default time a toast stays, in ms. A toast's own `duration` wins. */
  duration?: number
  /** How many toasts show at once in the pile; the newest in front. */
  limit?: number
  /** Keeps the pile opened into a list instead of opening it on hover. */
  expand?: boolean
  /** Name of the notification region for screen reader users. F8 moves the focus to it. */
  label?: string
  /** Accessible name of every close button. */
  closeLabel?: string
  /** Classes for the list, to move it. */
  className?: string
}

/**
 * Toaster: mount it once near the app root, then open toasts with `toast()`. They appear at the bottom
 * right and pile up with the newest in front, the older ones smaller and lifted behind it; the pile opens
 * into a list on hover or focus. A toast closes by itself, on its close button, after its action and on a
 * swipe; hovering pauses the timers.
 */
export function Toaster({
  duration = 5000,
  limit = 3,
  expand = false,
  label = 'Notifications',
  closeLabel = 'Close',
  className,
}: ToasterProps) {
  return (
    <SonnerToaster
      position="bottom-right"
      duration={duration}
      visibleToasts={limit}
      expand={expand}
      gap={14}
      offset="var(--spacing-4)"
      mobileOffset="var(--spacing-4)"
      hotkey={['F8']}
      containerAriaLabel={label}
      closeButton
      icons={statusIcons}
      className={className}
      // The toast width, 400px: step 100 of the spacing scale, as `w-100`.
      style={{ '--width': 'calc(var(--spacing-1) * 100)' } as CSSProperties}
      toastOptions={{
        unstyled: true,
        closeButtonAriaLabel: closeLabel,
        classNames: {
          toast: toastClass,
          icon: leadingClass,
          content: contentClass,
          title: titleClass,
          description: descriptionClass,
          actionButton: actionClass,
          closeButton: closeClass,
        },
      }}
    />
  )
}

export type ToastPanelProps = Omit<ComponentProps<'div'>, 'children'> &
  Pick<ToastOptions, 'label' | 'description' | 'leadingSlot'> & {
    /** The action, shown as in a toast: pass a label. */
    action?: ReactNode
    /** Accessible name of the close button. */
    closeLabel?: string
    /** Called by the close button. */
    onClose?: () => void
  }

/**
 * The toast card without any behavior, drawn in the page: for docs and for showing a toast in a layout.
 * It has the same parts and look as a toast in the `Toaster`.
 */
export function ToastPanel({
  label,
  description,
  leadingSlot,
  action,
  closeLabel = 'Close',
  onClose,
  className,
  ...props
}: ToastPanelProps) {
  return (
    <div data-slot="toast" className={cn(toastClass, 'w-100', className)} {...props}>
      {hasContent(leadingSlot) && (
        <span data-slot="toast-leading-slot" className={leadingClass}>
          {leadingSlot}
        </span>
      )}
      <div data-slot="toast-content" className={contentClass}>
        <div data-slot="toast-title" className={titleClass}>
          {label}
        </div>
        {hasContent(description) && (
          <div data-slot="toast-description" className={descriptionClass}>
            {description}
          </div>
        )}
      </div>
      {hasContent(action) && (
        <button type="button" data-slot="toast-action" className={actionClass}>
          {action}
        </button>
      )}
      <button
        type="button"
        data-slot="toast-close"
        aria-label={closeLabel}
        onClick={onClose}
        className={cn(iconButtonVariants({ tone: 'default', variant: 'ghost', size: 'sm' }), 'shrink-0')}
      >
        <CloseIcon />
      </button>
    </div>
  )
}

/** The status icons of the shortcuts, for docs and for a `ToastPanel` that shows a status. */
export const toastStatusIcons = {
  success: statusIcons.success,
  info: statusIcons.info,
  warning: statusIcons.warning,
  error: statusIcons.error,
}
