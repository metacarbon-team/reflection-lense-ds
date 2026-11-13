// The box and marks of Checkbox, shared with the checkbox row of Dropdown Menu. The colors stay with each
// consumer: Checkbox reads its own `data-state`, the menu row reads the row's (`group/item`), and Tailwind
// needs the full class names written out in each file.

import type { ComponentProps } from 'react'

/** 20×20 box with the mark centered; the consumer adds border, fill, text color and shadow per state. */
export const checkboxBoxClass = 'inline-flex size-5 shrink-0 items-center justify-center rounded-md border'

type MarkProps = ComponentProps<'svg'>

const Mark = ({ children, ...props }: MarkProps) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.333}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    {children}
  </svg>
)

/** Checked. Hide it while indeterminate. */
export const CheckboxCheckMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M2.667 8l3.333 3.333 7.333-7.333" />
  </Mark>
)

/** Indeterminate. Show it only while indeterminate. */
export const CheckboxIndeterminateMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M2.667 8h10.667" />
  </Mark>
)
