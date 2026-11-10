/**
 * Frame shared by Input, Textarea and the Select trigger: form surface, neutral stroke, small shadow;
 * stronger stroke on hover, focus ring on focus, danger stroke when invalid, disabled fill.
 */
export const controlFrameClass = [
  'rounded-md border border-neutral bg-form-neutral text-body-small text-neutral shadow-sm',
  'hover:border-neutral-emphasized',
  'data-invalid:border-danger-emphasized',
  'data-disabled:pointer-events-none data-disabled:border-disabled data-disabled:bg-disabled data-disabled:text-disabled data-disabled:shadow-none',
]
