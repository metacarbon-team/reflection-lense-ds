import { cva } from 'class-variance-authority'
import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import type { ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { controlTransitionClass } from '../../lib/motion'
import { useFieldControl } from '../field/field'

/**
 * The box at rest in every selection, read from `data-state` and the disabled state of the element
 * itself, so it works on a native control (Checkbox) and on a plain element (`CheckboxBox`) alike.
 * Selection colors and the shadow apply only while enabled (`not-disabled:not-data-disabled:`), so the
 * disabled look always wins and a disabled box has no shadow. `disabled:` also matches a control inside
 * `<fieldset disabled>`; `data-disabled:` covers an element that is not a form control.
 * Interaction states (hover, focus, error) are the control's own: Checkbox adds them with the same
 * `not-disabled:not-data-disabled:` prefix.
 */
const checkboxLookClass = [
  'inline-flex size-5 shrink-0 items-center justify-center rounded-md border',
  'not-disabled:not-data-disabled:data-[state=unchecked]:border-neutral-emphasized not-disabled:not-data-disabled:data-[state=unchecked]:bg-form-neutral not-disabled:not-data-disabled:data-[state=unchecked]:shadow-xs',
  'not-disabled:not-data-disabled:data-[state=checked]:border-transparent not-disabled:not-data-disabled:data-[state=checked]:bg-neutral-emphasized not-disabled:not-data-disabled:data-[state=checked]:text-neutral-on-emphasized not-disabled:not-data-disabled:data-[state=checked]:shadow-xs',
  'not-disabled:not-data-disabled:data-[state=indeterminate]:border-neutral-emphasized not-disabled:not-data-disabled:data-[state=indeterminate]:bg-neutral not-disabled:not-data-disabled:data-[state=indeterminate]:text-neutral not-disabled:not-data-disabled:data-[state=indeterminate]:shadow-xs',
  'disabled:data-[state=unchecked]:border-disabled disabled:data-[state=unchecked]:bg-disabled',
  'disabled:data-[state=checked]:border-transparent disabled:data-[state=checked]:bg-disabled disabled:data-[state=checked]:text-disabled',
  'disabled:data-[state=indeterminate]:border-transparent disabled:data-[state=indeterminate]:bg-disabled disabled:data-[state=indeterminate]:text-disabled',
  'data-disabled:data-[state=unchecked]:border-disabled data-disabled:data-[state=unchecked]:bg-disabled',
  'data-disabled:data-[state=checked]:border-transparent data-disabled:data-[state=checked]:bg-disabled data-disabled:data-[state=checked]:text-disabled',
  'data-disabled:data-[state=indeterminate]:border-transparent data-disabled:data-[state=indeterminate]:bg-disabled data-disabled:data-[state=indeterminate]:text-disabled',
]

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
const CheckboxCheckMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M2.667 8l3.333 3.333 7.333-7.333" />
  </Mark>
)

/** Indeterminate. Show it only while indeterminate. */
const CheckboxIndeterminateMark = (props: MarkProps) => (
  <Mark {...props}>
    <path d="M2.667 8h10.667" />
  </Mark>
)

/**
 * The resting look of every selection, disabled included, is `checkboxLookClass`, shared with Checkbox Box; this
 * adds the interaction states. They use the same `not-disabled:not-data-disabled:` prefix, so a disabled
 * checkbox ignores them. Hover and focus-visible come from the browser in `default`; the `hover` and
 * `focus` variants freeze them for docs and tests (same modifiers as the resting class, so `cn` keeps the
 * frozen one); `error` comes from `aria-invalid`, a Field error or `state="error"`, and outranks the rest.
 */
const checkboxVariants = cva(
  [
    checkboxLookClass,
    controlTransitionClass,
    'group/checkbox peer align-middle outline-none disabled:pointer-events-none data-disabled:pointer-events-none',
    'not-disabled:not-data-disabled:aria-invalid:data-[state=unchecked]:border-danger-emphasized',
    'not-disabled:not-data-disabled:aria-invalid:data-[state=checked]:bg-danger-emphasized not-disabled:not-data-disabled:aria-invalid:data-[state=checked]:text-danger-on-emphasized',
    'not-disabled:not-data-disabled:aria-invalid:data-[state=checked]:hover:bg-danger-emphasized-hover',
    'not-disabled:not-data-disabled:aria-invalid:data-[state=indeterminate]:border-transparent not-disabled:not-data-disabled:aria-invalid:data-[state=indeterminate]:bg-danger-emphasized not-disabled:not-data-disabled:aria-invalid:data-[state=indeterminate]:text-danger-on-emphasized',
    'not-disabled:not-data-disabled:aria-invalid:data-[state=indeterminate]:hover:bg-danger-emphasized-hover',
  ],
  {
    variants: {
      state: {
        default: [
          'not-disabled:not-data-disabled:data-[state=unchecked]:hover:bg-form-neutral-hover',
          'not-disabled:not-data-disabled:data-[state=checked]:hover:bg-neutral-emphasized-hover',
          'not-disabled:not-data-disabled:data-[state=indeterminate]:hover:bg-neutral-hover',
          // The ring is added; the border stays the selection's. Repeated per selection: `data-[state=…]:shadow-xs` at rest is more specific than a bare `focus-visible:`.
          'not-disabled:not-data-disabled:data-[state=unchecked]:focus-visible:shadow-focus-ring',
          'not-disabled:not-data-disabled:data-[state=checked]:focus-visible:shadow-focus-ring',
          'not-disabled:not-data-disabled:data-[state=indeterminate]:focus-visible:shadow-focus-ring',
        ],
        hover: [
          'not-disabled:not-data-disabled:data-[state=unchecked]:bg-form-neutral-hover',
          'not-disabled:not-data-disabled:data-[state=checked]:bg-neutral-emphasized-hover',
          'not-disabled:not-data-disabled:data-[state=indeterminate]:bg-neutral-hover',
        ],
        focus: [
          'not-disabled:not-data-disabled:data-[state=unchecked]:shadow-focus-ring',
          'not-disabled:not-data-disabled:data-[state=checked]:shadow-focus-ring',
          'not-disabled:not-data-disabled:data-[state=indeterminate]:shadow-focus-ring',
        ],
      },
    },
    defaultVariants: { state: 'default' },
  },
)

export type CheckboxProps = ComponentProps<typeof CheckboxPrimitive.Root> & {
  /** `false`, `true` or `'indeterminate'`, for a parent whose children are only partly selected. */
  checked?: boolean | 'indeterminate'
  /** Freezes `hover` or `focus` for docs and tests. `error` also sets `aria-invalid`; disabled comes from `disabled`. */
  state?: 'default' | 'hover' | 'focus' | 'error'
}

/**
 * Checkbox: a 20×20 box with three values: unchecked, checked and indeterminate. Use indeterminate
 * only for a parent whose children are partly selected: all selected is checked, none is unchecked.
 * Error comes from `aria-invalid`, a Field error or `state="error"`. Name it with a `<label htmlFor>` or `aria-label`.
 */
export function Checkbox({ state = 'default', className, ...props }: CheckboxProps) {
  const control = useFieldControl(props)
  const invalid = control.invalid || state === 'error'
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      {...props}
      {...control.attributes}
      aria-invalid={invalid || control.attributes['aria-invalid']}
      className={cn(checkboxVariants({ state: state === 'error' ? 'default' : state }), className)}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="flex size-4 items-center justify-center">
        <CheckboxCheckMark className="size-4 group-data-[state=indeterminate]/checkbox:hidden" />
        <CheckboxIndeterminateMark className="hidden size-4 group-data-[state=indeterminate]/checkbox:block" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export type CheckboxBoxProps = Omit<ComponentProps<'span'>, 'children'> & {
  /** `false`, `true` or `'indeterminate'`: the selection the box shows. */
  checked?: boolean | 'indeterminate'
  /** Draws the disabled look. The box itself blocks nothing: the element around it does. */
  disabled?: boolean
}

/**
 * Checkbox Box: the look of Checkbox without its behaviour, for an element that is itself the checkbox,
 * such as a `menuitemcheckbox` row of Dropdown Menu or an option of a multi-select list. A real Checkbox
 * there would be a second control: it would take focus and toggle twice. The box is decorative and
 * hidden from assistive tech, so the element around it carries the role, `aria-checked` and the
 * disabled state. Never use it as a form control on its own: use Checkbox.
 */
export function CheckboxBox({ checked = false, disabled, className, ...props }: CheckboxBoxProps) {
  const state = checked === 'indeterminate' ? 'indeterminate' : checked ? 'checked' : 'unchecked'
  return (
    <span
      aria-hidden="true"
      data-slot="checkbox-box"
      data-state={state}
      data-disabled={disabled ? '' : undefined}
      className={cn(checkboxLookClass, className)}
      {...props}
    >
      {state === 'checked' && <CheckboxCheckMark className="size-4" />}
      {state === 'indeterminate' && <CheckboxIndeterminateMark className="size-4" />}
    </span>
  )
}
