/**
 * Frame shared by Input, Textarea and the Select trigger: form surface, emphasized neutral stroke, small
 * shadow; the form hover on hover, focus ring on focus, danger stroke when invalid, disabled fill. The
 * fill and its hover come from the same `form` group, so the hover is measured against the field's own
 * fill.
 */
export const controlFrameClass = [
  'rounded-md border border-neutral-emphasized bg-form-neutral text-body-small text-neutral shadow-sm',
  'hover:bg-form-neutral-hover',
  'transition duration-150 ease-out-strong motion-reduce:transition-none',
  'data-invalid:border-danger-emphasized',
  'data-disabled:pointer-events-none data-disabled:border-disabled data-disabled:bg-disabled data-disabled:text-disabled data-disabled:shadow-none',
]
