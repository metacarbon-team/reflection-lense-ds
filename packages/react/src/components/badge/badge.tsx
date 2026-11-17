import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'

/**
 * Badge: a count or a dot attached to something else (a tab, an avatar, a nav item). Status tones
 * fill with their emphasized background; `default` sits on the form surface; `inverse` is the
 * emphasized neutral. `ghost` drops the fill and stroke.
 */
export const badgeVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-full border border-transparent whitespace-nowrap tabular-nums',
  {
    variants: {
      tone: {
        default: '',
        accent: 'bg-accent-emphasized text-accent-on-emphasized',
        success: 'bg-success-emphasized text-success-on-emphasized',
        warning: 'bg-warning-emphasized text-warning-on-emphasized',
        danger: 'bg-danger-emphasized text-danger-on-emphasized',
        info: 'bg-info-emphasized text-info-on-emphasized',
        inverse: 'bg-neutral-emphasized text-neutral-on-emphasized',
      },
      variant: { solid: '', ghost: 'bg-transparent text-neutral' },
      size: { md: '', sm: '' },
      dot: { false: 'text-label-small', true: '' },
      disabled: { false: '', true: '' },
    },
    compoundVariants: [
      {
        tone: 'default',
        variant: 'solid',
        dot: false,
        className: 'border-neutral-subtle bg-form-neutral text-neutral',
      },
      { dot: false, size: 'md', className: 'h-5 min-w-5 px-1' },
      { dot: false, size: 'sm', className: 'h-4 min-w-4 px-0.5' },
      // Dots take the text color as their fill.
      { dot: true, size: 'md', className: 'size-2.5' },
      { dot: true, size: 'sm', className: 'size-2' },
      { dot: true, tone: 'default', className: 'border-neutral-subtle bg-current text-neutral-subtle' },
      { dot: true, tone: 'inverse', className: 'bg-current text-neutral' },
      { disabled: true, variant: 'solid', dot: false, className: 'border-disabled bg-disabled text-disabled' },
      { disabled: true, variant: 'ghost', className: 'text-disabled' },
      { disabled: true, dot: true, className: 'border-transparent bg-current text-disabled' },
    ],
    defaultVariants: { tone: 'default', variant: 'solid', size: 'md', dot: false, disabled: false },
  },
)

export type BadgeProps = Omit<ComponentProps<'span'>, 'children'> &
  VariantProps<typeof badgeVariants> & {
    /** The count; ignored for a dot. */
    children?: ComponentProps<'span'>['children']
  }

/**
 * A plain span cannot carry a name, so a Badge with `aria-label` (or `aria-labelledby`) becomes an image
 * with that name, such as "3 unread messages". Without a name a count is read as its number, and a dot,
 * which has no text, is hidden: give a dot a name whenever its color means something.
 */
export function Badge({
  className,
  tone = 'default',
  variant = 'solid',
  size = 'md',
  dot,
  disabled,
  children,
  ...props
}: BadgeProps) {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined
  return (
    <span
      data-slot="badge"
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      data-disabled={disabled ? '' : undefined}
      {...(labelled ? { role: 'img' } : dot ? { 'aria-hidden': true } : {})}
      className={cn(badgeVariants({ tone, variant, size, dot, disabled }), className)}
      {...props}
    >
      {dot ? null : children}
    </span>
  )
}
