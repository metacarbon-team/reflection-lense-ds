import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { ModeAnchor, useModeAnchorRef, usePortalMode } from '../../lib/portal-mode'
import { dialogMotionClass, overlayMotionClass } from '../../lib/motion'
import { hasContent } from '../../lib/has-content'
import { CloseIcon } from '../../lib/icons'
import { IconBox } from '../icon-box/icon-box'
import { IconButton } from '../icon-button/icon-button'

// Radix renders no Overlay for a non-modal dialog, so the content must not sit inside one.
const DialogModalContext = createContext(true)

/** The dialog root: owns the open state. Modal by default; `modal={false}` keeps the page usable behind it. */
export const Dialog = ({ modal = true, ...props }: ComponentProps<typeof DialogPrimitive.Root>) => (
  <DialogModalContext value={modal}>
    <ModeAnchor>
      <DialogPrimitive.Root data-slot="dialog" modal={modal} {...props} />
    </ModeAnchor>
  </DialogModalContext>
)

export function DialogTrigger({ ref, ...props }: ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" ref={useModeAnchorRef(ref)} {...props} />
}

export const DialogClose = (props: ComponentProps<typeof DialogPrimitive.Close>) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
)

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  /**
   * `inline` aligns the text to the left and puts the actions in one row on the right. `stacked` centers
   * the header and stacks full-width actions, which suits short confirmations. The header and the footer
   * follow it.
   */
  layout?: 'inline' | 'stacked'
  /** The ghost close button in the header corner. It is on in `inline` and off in `stacked`, unless you set it. */
  showCloseButton?: boolean
  /** Accessible name of the close button. */
  closeLabel?: string
}

/**
 * The dialog on its overlay: modal, focus trapped, Escape and the backdrop close it. Compose it from
 * DialogHeader (DialogTitle, DialogDescription), DialogBody and DialogFooter.
 */
export function DialogContent({
  className,
  children,
  layout = 'inline',
  showCloseButton = layout === 'inline',
  closeLabel = 'Close',
  ...props
}: DialogContentProps) {
  const modal = useContext(DialogModalContext)
  // The overlay or the positioner takes the color mode of the trigger's subtree.
  const mode = usePortalMode()
  const content = (
    <DialogPrimitive.Content
      data-slot="dialog-content"
      data-layout={layout}
      data-close-button={showCloseButton || undefined}
      className={cn(
        'group/dialog pointer-events-auto relative flex w-full max-w-md flex-col rounded-xl border border-neutral bg-card-neutral-subtle text-neutral shadow-xl outline-none',
        dialogMotionClass,
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild data-slot="dialog-close">
          <IconButton
            aria-label={closeLabel}
            tone="default"
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4"
          >
            <CloseIcon />
          </IconButton>
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  )
  return (
    <DialogPrimitive.Portal>
      {modal ? (
        <DialogPrimitive.Overlay
          data-mode={mode}
          data-slot="dialog-overlay"
          className={cn(
            'fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-surface-backdrop p-4',
            overlayMotionClass,
          )}
        >
          {content}
        </DialogPrimitive.Overlay>
      ) : (
        // No backdrop: the same centering, and the page behind stays clickable.
        <div
          data-mode={mode}
          data-slot="dialog-positioner"
          className="pointer-events-none fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4"
        >
          {content}
        </div>
      )}
    </DialogPrimitive.Portal>
  )
}

export type DialogHeaderProps = ComponentProps<'div'> & {
  /** The icon of the Icon Box above the title, one icon that sets the tone, such as a warning. The header draws the Icon Box around it when it is set. */
  icon?: ReactNode
}

/** Title and description, with an optional Icon Box (`icon`) above them. Next to the close button it keeps the header gap (12px) to it. In `stacked` the text and the Icon Box are centered. */
export function DialogHeader({ className, icon, children, ...props }: DialogHeaderProps) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex flex-col gap-3 px-4 pt-4 group-data-close-button/dialog:pr-15',
        'group-data-[layout=stacked]/dialog:items-center group-data-[layout=stacked]/dialog:text-center',
        className,
      )}
      {...props}
    >
      {hasContent(icon) && (
        <div data-slot="dialog-icon-box" className="flex">
          <IconBox icon={icon} />
        </div>
      )}
      <div data-slot="dialog-heading" className="flex w-full flex-col gap-1">
        {children}
      </div>
    </div>
  )
}

export function DialogTitle({ className, ...props }: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-heading-small text-neutral', className)}
      {...props}
    />
  )
}

export function DialogDescription({ className, ...props }: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-body text-neutral-subtle', className)}
      {...props}
    />
  )
}

export function DialogBody({ className, ...props }: ComponentProps<'div'>) {
  return <div data-slot="dialog-body" className={cn('flex flex-col px-4 pt-4', className)} {...props} />
}

/** `inline`: actions in a row at the end. `stacked`: full-width actions, primary first. */
const dialogFooterVariants = cva('flex gap-2 p-4', {
  variants: {
    layout: {
      inline: 'flex-wrap items-center justify-end',
      stacked: 'flex-col *:w-full',
    },
  },
  defaultVariants: { layout: 'inline' },
})

// Without `layout` the footer follows the `layout` of DialogContent.
const dialogFooterAuto = [
  'flex flex-wrap items-center justify-end gap-2 p-4',
  'group-data-[layout=stacked]/dialog:flex-col group-data-[layout=stacked]/dialog:flex-nowrap',
  'group-data-[layout=stacked]/dialog:items-stretch group-data-[layout=stacked]/dialog:justify-start',
  'group-data-[layout=stacked]/dialog:*:w-full',
]

export type DialogFooterProps = ComponentProps<'div'> & {
  /** Sets the footer layout on its own. By default it follows the `layout` of DialogContent. */
  layout?: VariantProps<typeof dialogFooterVariants>['layout']
}

export function DialogFooter({ className, layout, ...props }: DialogFooterProps) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(layout === undefined ? dialogFooterAuto : dialogFooterVariants({ layout }), className)}
      {...props}
    />
  )
}
