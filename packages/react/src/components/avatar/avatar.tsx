import { cva, type VariantProps } from 'class-variance-authority'
import { Avatar as AvatarPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { UserIcon } from '../../lib/icons'

/** Classes of the circle: tone sets the fill and letter color, size sets the circle and the text role. */
export const avatarVariants = cva(
  'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full align-middle select-none',
  {
    variants: {
      tone: {
        accent: 'bg-accent-subtle text-accent',
        default: 'bg-neutral text-neutral',
        inverse: 'bg-neutral-emphasized text-neutral-on-emphasized',
      },
      size: {
        sm: 'size-6 text-label-small [&_svg]:size-3',
        md: 'size-8 text-label-small [&_svg]:size-4',
        lg: 'size-10 text-label [&_svg]:size-5',
      },
    },
    defaultVariants: { tone: 'accent', size: 'sm' },
  },
)

export type AvatarProps = Omit<ComponentProps<typeof AvatarPrimitive.Root>, 'children'> & {
  /** Fill of the circle. Accent and default sit on a soft tint; inverse is solid dark. There are no status tones. */
  tone?: VariantProps<typeof avatarVariants>['tone']
  /** Circle size: 24, 32 or 40 px. The letters and the icon scale with it. */
  size?: VariantProps<typeof avatarVariants>['size']
  /** What fills the circle: two letters, a generic profile icon, or a profile photo. */
  kind?: 'initials' | 'icon' | 'image'
  /** The letters of an initials avatar. Up to two letters. Also shown while a photo loads or if it fails. */
  initials?: string
  /** The photo of an image avatar. */
  src?: string
  /** Describes the photo. Leave it empty when a name is written next to the avatar. */
  alt?: string
}

/**
 * Avatar: a round picture of a user or an agent. It falls back to two initials or a generic profile
 * icon when there is no photo, or while the photo loads.
 */
export function Avatar({ className, tone, size, kind = 'initials', initials, src, alt = '', ...props }: AvatarProps) {
  return (
    <AvatarPrimitive.Root data-slot="avatar" className={cn(avatarVariants({ tone, size }), className)} {...props}>
      {kind === 'image' ? (
        <AvatarPrimitive.Image data-slot="avatar-image" src={src} alt={alt} className="size-full object-cover" />
      ) : null}
      <AvatarPrimitive.Fallback data-slot="avatar-fallback" className="inline-flex items-center justify-center">
        {kind === 'icon' || !initials ? <UserIcon /> : initials}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
