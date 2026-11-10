import type { MouseEvent } from 'react'

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
 * Keeps a disabled element that is not a native control (a link, a router link under `asChild`)
 * from acting: it leaves the tab order, and a click is cancelled. `pointer-events-none` stops only
 * the mouse; assistive tech still sends a click. Spread it after the caller's props so their
 * `onClick` does not run. Router links skip navigation when the click is cancelled.
 */
export const inertProps = (disabled: boolean | undefined) => (disabled ? { tabIndex: -1, onClick: cancelClick } : {})
