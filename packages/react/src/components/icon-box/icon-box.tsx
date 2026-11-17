import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'

export type IconBoxProps = Omit<ComponentProps<'div'>, 'children'> & {
  /**
   * The content of the box: one icon, a logo or an illustration. An icon is drawn 20 × 20 inside the
   * 40 × 40 box, so give it one icon and leave room around it. The box is empty when the slot is not set.
   */
  icon?: ReactNode
}

/**
 * Icon Box: an icon in a 40 px bordered square. Dialog Header and Empty State draw it
 * around the `icon` they are given. The box is decorative and hidden from assistive technology; when the icon carries
 * a meaning of its own, set `aria-label` and the box becomes an image with that name.
 */
export function IconBox({ icon, className, ...props }: IconBoxProps) {
  const labelled = props['aria-label'] !== undefined || props['aria-labelledby'] !== undefined
  return (
    <div
      data-slot="icon-box"
      {...(labelled ? { role: 'img' } : { 'aria-hidden': true })}
      className={cn(
        'inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-neutral-subtle bg-neutral-subtle text-neutral',
        '[&_svg]:size-5 [&_svg]:shrink-0',
        className,
      )}
      {...props}
    >
      {hasContent(icon) && icon}
    </div>
  )
}
