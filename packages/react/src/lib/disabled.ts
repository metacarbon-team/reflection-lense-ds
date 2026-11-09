type DisabledAttrs = { disabled?: true; 'aria-disabled'?: true; 'data-disabled'?: '' }

/**
 * The attributes of a disabled element: one rule for every component. `data-disabled` always marks
 * it, and styles use only `data-disabled:`. A native control (button, input) also gets the real
 * `disabled`; anything else (a link, a div with a role) gets `aria-disabled`.
 *
 * The value is `''`, never `false`: React renders `data-disabled={false}` as `data-disabled="false"`,
 * and Tailwind's `data-disabled:` only checks that the attribute is present, so an enabled element
 * would look disabled. An enabled element gets no attributes at all.
 */
export const disabledAttrs = (disabled: boolean | undefined, native: boolean): DisabledAttrs =>
  disabled ? (native ? { disabled: true, 'data-disabled': '' } : { 'aria-disabled': true, 'data-disabled': '' }) : {}
