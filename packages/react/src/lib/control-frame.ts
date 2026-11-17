import { controlTransitionClass } from './motion'

/**
 * Frame shared by Input, Textarea and the Select trigger: form surface, neutral stroke, small shadow. On
 * hover the stroke turns emphasized and the form hover fills it; focus ring on focus, danger stroke when
 * invalid, disabled fill. The fill and its hover come from the same `form` group, so the hover is
 * measured against the field's own fill. Disabled is read from the DOM, so a `disabled` prop and a
 * `<fieldset disabled>` look the same: `disabled:` when the frame is the control (Textarea, the Select
 * trigger), `has-[input:disabled]:` when it wraps one (Input): only the input itself, so a disabled
 * button in a slot does not dim the whole field.
 */
export const controlFrameClass = [
  'rounded-md border border-neutral bg-form-neutral text-body-small text-neutral shadow-sm',
  controlTransitionClass,
  'hover:border-neutral-emphasized hover:bg-form-neutral-hover',
  'data-invalid:border-danger-emphasized',
  'disabled:pointer-events-none disabled:border-disabled disabled:bg-disabled disabled:text-disabled disabled:shadow-none',
  'has-[input:disabled]:pointer-events-none has-[input:disabled]:border-disabled has-[input:disabled]:bg-disabled has-[input:disabled]:text-disabled has-[input:disabled]:shadow-none',
]
