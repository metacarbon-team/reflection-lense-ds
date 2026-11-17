import type { MouseEvent } from 'react'
import { controlTransitionClass } from './motion'

/**
 * The look of every field frame: form surface, neutral stroke, small shadow; on hover the stroke turns
 * emphasized and the form hover fills it. The fill and its hover come from the same `form` group, so
 * the hover is measured against the field's own fill.
 */
export const controlFrameLookClass = [
  'rounded-md border border-neutral bg-form-neutral text-body-small text-neutral shadow-sm',
  controlTransitionClass,
  'hover:border-neutral-emphasized hover:bg-form-neutral-hover',
]

/**
 * A frame that is the control itself (Textarea, the Select trigger): the look, and the states read from
 * the element. `disabled:` also matches a control inside `<fieldset disabled>`. Each consumer adds its
 * own focus treatment.
 */
export const controlFrameClass = [
  controlFrameLookClass,
  'data-invalid:border-danger-emphasized',
  'disabled:pointer-events-none disabled:border-disabled disabled:bg-disabled disabled:text-disabled disabled:shadow-none',
]

/**
 * A frame that wraps a text control and its slots (Input, Composed Input). The control carries
 * `data-slot="input-group-control"`, and the frame reads focus, the open popup, invalid and disabled
 * from that control only: a button in a slot that takes focus or is disabled does not change the frame.
 * Put `group/input-group` on the frame so the slots can dim with the control (`inputGroupAddonClass`).
 */
export const inputGroupStateClass = [
  'has-[[data-slot=input-group-control]:focus-visible]:shadow-focus-ring',
  // A control that opens a popup (the Date Picker field) keeps the ring while the popup is open.
  'has-[[data-slot=input-group-control][aria-expanded=true]]:shadow-focus-ring',
  'has-[[data-slot=input-group-control][aria-invalid=true]]:border-danger-emphasized',
  'has-[[data-slot=input-group-control]:disabled]:pointer-events-none has-[[data-slot=input-group-control]:disabled]:border-disabled has-[[data-slot=input-group-control]:disabled]:bg-disabled has-[[data-slot=input-group-control]:disabled]:text-disabled has-[[data-slot=input-group-control]:disabled]:shadow-none',
]

/** The slots of a wrapping frame dim with its control. */
export const inputGroupAddonClass = 'group-has-[[data-slot=input-group-control]:disabled]/input-group:text-disabled'

/**
 * A click on the frame or on a slot's icon puts the focus in the control, so the whole frame acts as
 * the field. A click on a button, link or another control in a slot is left to that element.
 */
export function focusGroupControl(event: MouseEvent<HTMLElement>) {
  const target = event.target as HTMLElement
  if (target.closest('[data-slot=input-group-control], button, a, input, textarea, select, [role=button]')) return
  event.currentTarget.querySelector<HTMLElement>('[data-slot=input-group-control]')?.focus()
}
