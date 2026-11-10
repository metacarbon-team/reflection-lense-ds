/**
 * Frame shared by Input, Textarea and the Select trigger: form surface, emphasized neutral stroke, small
 * shadow; the form hover on hover, focus ring on focus, danger stroke when invalid, disabled fill. The
 * fill and its hover come from the same `form` group, so the hover is measured against the field's own
 * fill. Disabled is read from the DOM, so a `disabled` prop and a `<fieldset disabled>` look the same:
 * `disabled:` when the frame is the control (Textarea, the Select trigger), `has-disabled:` when it wraps
 * one (Input).
 */
export const controlFrameClass = [
  'rounded-md border border-neutral-emphasized bg-form-neutral text-body-small text-neutral shadow-sm',
  'hover:bg-form-neutral-hover',
  'data-invalid:border-danger-emphasized',
  'disabled:pointer-events-none disabled:border-disabled disabled:bg-disabled disabled:text-disabled disabled:shadow-none',
  'has-disabled:pointer-events-none has-disabled:border-disabled has-disabled:bg-disabled has-disabled:text-disabled has-disabled:shadow-none',
]
