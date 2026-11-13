import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { disabledAttrs } from '../../lib/disabled'

/**
 * Size sets the row padding and the text roles of its parts. Hover, pressed and focus-visible come
 * from the browser in `default`; the `hover`, `pressed` and `focus` states freeze them for docs and
 * tests. `active` marks the current row. A disabled row is marked with `data-disabled`: the row
 * ignores the pointer, and each part takes its colors from `group-data-disabled`. `clickable` is a
 * row that is a `label` for the control in its slot.
 */
const itemVariants = cva(
  'group/item relative flex w-full min-w-0 flex-col justify-center rounded-md outline-none data-disabled:pointer-events-none',
  {
    variants: {
      size: {
        md: 'px-3 py-1',
        lg: 'px-4 py-3',
      },
      state: {
        default: 'hover:bg-ghost-neutral-hover active:bg-ghost-neutral-pressed focus-visible:shadow-focus-ring',
        hover: 'bg-ghost-neutral-hover',
        pressed: 'bg-ghost-neutral-pressed',
        active: 'bg-ghost-neutral-active',
        focus: 'shadow-focus-ring',
      },
      clickable: { true: 'cursor-pointer', false: '' },
    },
    defaultVariants: { size: 'md', state: 'default', clickable: false },
  },
)

// Text roles of the parts per size. The meta and the error label share the meta role.
const itemTitleVariants = cva('min-w-0 flex-1 truncate text-neutral group-data-disabled/item:text-disabled', {
  variants: { size: { md: 'text-label', lg: 'text-label-large' } },
  defaultVariants: { size: 'md' },
})

const metaRole = { md: 'text-body-small', lg: 'text-body-small' }

const itemMetaVariants = cva('shrink-0 whitespace-nowrap text-neutral-subtle group-data-disabled/item:text-disabled', {
  variants: { size: metaRole },
  defaultVariants: { size: 'md' },
})

const itemErrorVariants = cva('block truncate text-danger group-data-disabled/item:text-disabled', {
  variants: { size: metaRole },
  defaultVariants: { size: 'md' },
})

const itemDescriptionVariants = cva('line-clamp-2 text-neutral-subtle group-data-disabled/item:text-disabled', {
  variants: { size: { md: 'text-body-xsmall', lg: 'text-body-small' } },
  defaultVariants: { size: 'md' },
})

// A slot hugs its content. An icon, a checkbox and a radio are 16 × 16, and the description is indented
// by that width for each slot; anything else, such as a switch or an avatar, keeps its own size.
const slotClass = [
  'flex min-h-4 shrink-0 items-center justify-center group-data-disabled/item:text-disabled',
  '[&_svg]:size-4 [&_svg]:shrink-0 [&_[data-slot=checkbox]]:size-4 [&_[data-slot=radio]]:size-4',
]

export type ItemProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The row title. One line, cut with an ellipsis when it does not fit. */
  label: ReactNode
  /** Secondary text under the title. Wraps to two lines, then is cut with an ellipsis. */
  description?: ReactNode
  /** The danger message under the description. One line, cut with an ellipsis, so keep it short. */
  errorLabel?: ReactNode
  /** Short meta text on the right. It never shrinks, so keep it short: the title takes what is left. */
  metaLabel?: ReactNode
  /** Content before the title: an icon, an avatar, a checkbox or a radio. The slot hugs its content: an icon, a checkbox and a radio are 16 × 16. The row shows the slot when it is set. */
  leadingSlot?: ReactNode
  /** Content at the end of the row: an icon, a switch or buttons. The slot hugs its content: an icon is 16 × 16, a switch keeps its own size. The row shows the slot when it is set. */
  trailingSlot?: ReactNode
  /** Adds a thin line under the row. */
  divider?: boolean
  /** L fits a title with a description. M is the dense one-line row, also used by every dropdown. */
  size?: VariantProps<typeof itemVariants>['size']
  /** Freezes `hover`, `pressed` or `focus` for docs and tests. `active` marks the current row. */
  state?: VariantProps<typeof itemVariants>['state']
  /**
   * Blocks the row and dims its text. With `htmlFor`, also disable the control in the slot: the row
   * only takes the disabled look, the control itself is what must be blocked.
   */
  disabled?: boolean
  /**
   * The `id` of the checkbox, radio or switch in a slot. The row becomes a `label` for it, so a click
   * anywhere on the row toggles the control and the row text names it.
   */
  htmlFor?: string
}

/** Keeps the description and the error under the title: an empty space the width of each slot on both sides. */
function Indented({ leading, trailing, children }: { leading: boolean; trailing: boolean; children: ReactNode }) {
  return (
    <span className="flex items-start gap-2">
      {leading && <span aria-hidden="true" className="w-4 shrink-0" />}
      <span className="min-w-0 flex-1">{children}</span>
      {trailing && <span aria-hidden="true" className="w-4 shrink-0" />}
    </span>
  )
}

/**
 * Item: one list row. A control or icon on the left, a title with a description, a meta label and
 * actions on the right. Everything but the title is optional. The row is a plain `div`: give it a
 * `role` and handlers when it is interactive, or set `htmlFor` to tie it to a control in a slot.
 */
export function Item({
  label,
  description,
  errorLabel,
  metaLabel,
  leadingSlot,
  trailingSlot,
  divider = false,
  size = 'md',
  state = 'default',
  disabled = false,
  htmlFor,
  className,
  ...props
}: ItemProps) {
  const isDisabled = disabled
  // `aria-disabled` only means something on an element with a role. A plain row, or a label tied to a
  // control by `htmlFor`, gets just `data-disabled`.
  const { 'aria-disabled': ariaDisabled, ...disabledProps } = disabledAttrs(isDisabled, false)
  const hasLeading = hasContent(leadingSlot)
  const hasTrailing = hasContent(trailingSlot)
  const rootProps = {
    'data-slot': 'item',
    className: cn(
      // A disabled row drops the frozen states; its look comes from `data-disabled`.
      itemVariants({ size, state: isDisabled ? 'default' : state, clickable: htmlFor !== undefined }),
      className,
    ),
    ...props,
    ...disabledProps,
    ...(props.role && ariaDisabled ? { 'aria-disabled': ariaDisabled } : undefined),
  }
  // The row is made of inline elements only, so it is valid inside a <label>.
  const content = (
    <>
      <span className="flex items-center gap-2">
        {hasLeading && (
          <span data-slot="item-leading-slot" className={cn(slotClass)}>
            {leadingSlot}
          </span>
        )}
        <span data-slot="item-label" className={itemTitleVariants({ size })}>
          {label}
        </span>
        {hasContent(metaLabel) && (
          <span data-slot="item-meta" className={itemMetaVariants({ size })}>
            {metaLabel}
          </span>
        )}
        {hasTrailing && (
          <span data-slot="item-trailing-slot" className={cn(slotClass)}>
            {trailingSlot}
          </span>
        )}
      </span>
      {hasContent(description) && (
        <Indented leading={hasLeading} trailing={hasTrailing}>
          <span data-slot="item-description" className={itemDescriptionVariants({ size })}>
            {description}
          </span>
        </Indented>
      )}
      {hasContent(errorLabel) && (
        <Indented leading={hasLeading} trailing={hasTrailing}>
          <span data-slot="item-error" className={itemErrorVariants({ size })}>
            {errorLabel}
          </span>
        </Indented>
      )}
      {divider && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 border-b border-neutral-subtle group-data-disabled/item:border-disabled"
        />
      )}
    </>
  )
  // The props are typed for a div; a label takes the same attributes.
  return htmlFor === undefined ? (
    <div {...rootProps}>{content}</div>
  ) : (
    <label htmlFor={htmlFor} {...(rootProps as ComponentProps<'label'>)}>
      {content}
    </label>
  )
}
