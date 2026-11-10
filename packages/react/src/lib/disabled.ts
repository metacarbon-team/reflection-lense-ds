import { cloneElement, type MouseEvent, type ReactElement, type ReactNode } from 'react'

type DisabledAttrs = { disabled?: true; 'aria-disabled'?: true; 'data-disabled'?: '' }

/**
 * The attributes of a disabled element: one rule for every component. `data-disabled` always marks
 * it. A native control (button, input) also gets the real `disabled`; anything else (a link, a div
 * with a role) gets `aria-disabled`.
 *
 * Styles of an element that is always a native control use `disabled:`, which also matches a control
 * disabled by a `<fieldset disabled>` around it. An element that can be something else (`asChild`)
 * uses both `disabled:` and `data-disabled:`.
 *
 * The value is `''`, never `false`: React renders `data-disabled={false}` as `data-disabled="false"`,
 * and Tailwind's `data-disabled:` only checks that the attribute is present, so an enabled element
 * would look disabled. An enabled element gets no attributes at all.
 */
export const disabledAttrs = (disabled: boolean | undefined, native: boolean): DisabledAttrs =>
  disabled ? (native ? { disabled: true, 'data-disabled': '' } : { 'aria-disabled': true, 'data-disabled': '' }) : {}

const cancelClick = (event: MouseEvent) => event.preventDefault()

/**
 * A disabled link, the same in every component (Button, Icon Button, Link and Nav Item under
 * `asChild`, and Link itself): it keeps the link role, says it is disabled, leaves the tab order and
 * cancels the click. `pointer-events-none` stops only the mouse; assistive tech still sends a click.
 * Spread it after the caller's props, so their `onClick` does not run. Router links skip navigation
 * when the click is cancelled.
 */
export const disabledLinkProps = (disabled: boolean | undefined) =>
  disabled
    ? { role: 'link', 'aria-disabled': true as const, 'data-disabled': '' as const, tabIndex: -1, onClick: cancelClick }
    : {}

type LinkElement = ReactElement<{ href?: string; children?: ReactNode }>

/**
 * The child of an `asChild` control, optionally with new content. A disabled one loses its plain
 * `href`, so it cannot be followed; a router link builds its `href` from `to`, and the cancelled
 * click of {@link disabledLinkProps} stops it. The caller's element and its other props stay.
 */
export function linkChild(child: LinkElement, disabled: boolean | undefined, ...content: ReactNode[]) {
  return cloneElement(child, disabled ? { href: undefined } : undefined, ...content)
}
