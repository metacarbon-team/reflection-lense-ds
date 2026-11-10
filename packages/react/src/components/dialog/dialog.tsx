import { cva, type VariantProps } from 'class-variance-authority'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { CloseIcon } from '../../lib/icons'
import { IconButton } from '../icon-button/icon-button'

export const Dialog = (props: ComponentProps<typeof DialogPrimitive.Root>) => (
  <DialogPrimitive.Root data-slot="dialog" {...props} />
)

export const DialogTrigger = (props: ComponentProps<typeof DialogPrimitive.Trigger>) => (
  <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
)

export const DialogClose = (props: ComponentProps<typeof DialogPrimitive.Close>) => (
  <DialogPrimitive.Close data-slot="dialog-close" {...props} />
)

export type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  /** The ghost close button in the header corner. */
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
  showCloseButton = true,
  closeLabel = 'Close',
  ...props
}: DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-slot="dialog-overlay"
        className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-surface-backdrop p-4 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out motion-reduce:animate-none"
      >
        <DialogPrimitive.Content
          data-slot="dialog-content"
          data-close-button={showCloseButton || undefined}
          className={cn(
            'group/dialog relative flex w-full max-w-md flex-col rounded-xl border border-neutral bg-card-neutral-subtle text-neutral shadow-xl outline-none data-[state=open]:animate-pop-in data-[state=closed]:animate-pop-out motion-reduce:animate-none',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DialogPrimitive.Close asChild>
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
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  )
}

/** Title and description. Next to the close button it keeps the header gap (12px) to it. */
export function DialogHeader({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-1 px-4 pt-4 group-data-close-button/dialog:pr-15', className)}
      {...props}
    />
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

export function DialogFooter({
  className,
  layout,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof dialogFooterVariants>) {
  return <div data-slot="dialog-footer" className={cn(dialogFooterVariants({ layout }), className)} {...props} />
}
