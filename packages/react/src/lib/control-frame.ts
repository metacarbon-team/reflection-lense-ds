/**
 * Frame shared by Input, Textarea and the Select trigger: form surface, emphasized neutral stroke, small
 * shadow; focus ring on focus, danger stroke when invalid, disabled fill.
 */
export const controlFrameClass = [
  'rounded-md border border-neutral-emphasized bg-form-neutral text-body-small text-neutral shadow-sm',
  'transition duration-150 ease-out-strong motion-reduce:transition-none',
  'data-invalid:border-danger-emphasized',
  'data-disabled:pointer-events-none data-disabled:border-disabled data-disabled:bg-disabled data-disabled:text-disabled data-disabled:shadow-none',
]
