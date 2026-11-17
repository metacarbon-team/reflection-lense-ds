// Motion shared by the components. Enter and exit run on the Radix `data-state` of the animated element
// (the utilities come with the theme); Radix keeps the element mounted until the exit animation ends.
// With reduced motion the animations and transitions are off.

/**
 * A floating panel (Popover, Dropdown Menu, Select list, Date Picker): fades and grows from 95% on open,
 * slides 8px in from the trigger's side, and reverses on close. 150ms. Put it on the Radix Content, the
 * element that carries `data-state` and `data-side`, together with the primitive's transform origin
 * (`origin-(--radix-popover-content-transform-origin)`), so it grows out of the trigger.
 */
export const popupMotionClass = [
  'data-[state=open]:animate-in data-[state=closed]:animate-out',
  'data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
  'motion-reduce:animate-none',
]

/**
 * Tooltip: its open state is `delayed-open` or `instant-open`, so it animates in on mount and out on
 * `closed`, with the same fade, scale and slide as a floating panel.
 */
export const tooltipMotionClass = [
  'animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2',
  'motion-reduce:animate-none',
]

/** Dialog backdrop: fades in and out. 200ms, like the dialog on it. */
export const overlayMotionClass =
  'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 motion-reduce:animate-none'

/** Dialog: fades and grows from 95% on open, reverses on close. 200ms. */
export const dialogMotionClass =
  'duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95 motion-reduce:animate-none'

/** Interactive controls: color, fill, stroke and shadow changes (hover, pressed, focus, checked) ease over 150ms. */
export const controlTransitionClass = 'transition motion-reduce:transition-none'
