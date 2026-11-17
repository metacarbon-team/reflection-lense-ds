import { cva, type VariantProps } from 'class-variance-authority'
import { ToggleGroup as ToggleGroupPrimitive } from 'radix-ui'
import { createContext, useContext, type ComponentProps, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { controlTransitionClass } from '../../lib/motion'
import { hasContent } from '../../lib/has-content'
import { useControlled } from '../../lib/use-controlled'

type Size = NonNullable<VariantProps<typeof segmentedControlItemVariants>['size']>
const SizeContext = createContext<Size>('sm')

/**
 * The track: a muted, rounded strip that holds the segments, 4px around them. Its stroke is drawn over that
 * padding, not added to it, as Figma draws an inside stroke: 32px high with `sm` segments, 44px with `lg`.
 */
export const segmentedControlVariants = cva([
  'relative inline-flex items-center rounded-lg bg-neutral p-1',
  'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:border after:border-neutral-subtle',
])

/**
 * A segment. The selected one (`data-state="on"`) is raised on the track: the subtle fill, the neutral stroke
 * and the small shadow. The stroke is drawn inside the segment, as in Figma, so it adds nothing to the size.
 * Hover and focus-visible come from the browser in `default`; the `hover` and `focus` states freeze them for
 * docs and tests.
 */
export const segmentedControlItemVariants = cva(
  [
    'relative inline-flex shrink-0 items-center justify-center gap-1 whitespace-nowrap text-neutral-subtle outline-none select-none',
    'after:pointer-events-none after:absolute after:inset-0 after:border after:border-transparent',
    controlTransitionClass,
    'hover:bg-ghost-neutral-hover hover:text-neutral',
    // A disabled segment has no shadow, selected or not. Not `enabled:`, which matches only form controls.
    'data-[state=on]:bg-neutral-subtle data-[state=on]:text-neutral data-[state=on]:after:border-neutral not-disabled:not-data-disabled:data-[state=on]:shadow-sm',
    'focus-visible:bg-neutral-subtle focus-visible:text-neutral focus-visible:shadow-focus-ring',
    'disabled:pointer-events-none disabled:text-disabled data-disabled:pointer-events-none data-disabled:text-disabled',
    '[&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg]:shrink-0',
  ],
  {
    variants: {
      size: {
        sm: 'h-6 rounded-md px-2 text-caption after:rounded-md',
        lg: 'h-9 rounded-lg px-3 text-label after:rounded-lg',
      },
      state: {
        default: '',
        hover: 'bg-ghost-neutral-hover text-neutral',
        focus: 'bg-neutral-subtle text-neutral shadow-focus-ring',
      },
    },
    defaultVariants: { size: 'sm', state: 'default' },
  },
)

export type SegmentedControlProps<T extends string = string> = Omit<
  ToggleGroupPrimitive.ToggleGroupSingleProps,
  'type' | 'value' | 'defaultValue' | 'onValueChange'
> & {
  /** The selected segment. One segment is always selected: choosing it again keeps it. */
  value?: T
  /** The segment selected at first, when `value` is not controlled. */
  defaultValue?: T
  /**
   * Called with the value of the segment the user selects. Typed as the control's values (a union such as
   * `'light' | 'dark'`); the items' `value` props are expected to be those.
   */
  onValueChange?: (value: T) => void
  /** `sm` 24px segments, `lg` 36px. One size for every segment of a control. */
  size?: Size
}

/**
 * Segmented Control: a track of segments that selects one value, such as a view mode or a format. Radix
 * Toggle Group, single: the segments are radios, the arrow keys move between them, Space or Enter selects.
 * Name it with `aria-label`. For pages of content with panels, use Tabs.
 */
export function SegmentedControl<T extends string = string>({
  className,
  size = 'sm',
  value,
  defaultValue,
  onValueChange,
  ...props
}: SegmentedControlProps<T>) {
  const [selected, setSelected] = useControlled<string>(
    value,
    defaultValue ?? '',
    onValueChange as ((value: string) => void) | undefined,
  )
  return (
    <SizeContext value={size}>
      <ToggleGroupPrimitive.Root
        data-slot="segmented-control"
        data-size={size}
        type="single"
        value={selected}
        // Radix clears the value when the selected segment is pressed again; a segmented control keeps it.
        onValueChange={(next) => {
          if (next) setSelected(next)
        }}
        className={cn(segmentedControlVariants(), className)}
        {...props}
      />
    </SizeContext>
  )
}

export type SegmentedControlItemProps = Omit<ComponentProps<typeof ToggleGroupPrimitive.Item>, 'children'> & {
  /** Text of the segment, one or two words. Leave it out for an icon-only segment and name it with `aria-label`. */
  label?: ReactNode
  /** Content before the label, 16 × 16: usually an icon, or the only content of an icon-only segment. */
  leadingSlot?: ReactNode
  /** Content after the label, such as a counter. */
  trailingSlot?: ReactNode
  /** Freezes `hover` or `focus` for docs and tests. The selected look comes from the control's value. */
  state?: VariantProps<typeof segmentedControlItemVariants>['state']
}

/** One segment. `value` is what the control reports when it is selected; `disabled` blocks it. */
export function SegmentedControlItem({
  className,
  label,
  leadingSlot,
  trailingSlot,
  state,
  ...props
}: SegmentedControlItemProps) {
  const size = useContext(SizeContext)
  return (
    <ToggleGroupPrimitive.Item
      data-slot="segmented-control-item"
      className={cn(segmentedControlItemVariants({ size, state }), className)}
      {...props}
    >
      {hasContent(leadingSlot) && (
        <span data-slot="segmented-control-leading-slot" className="flex shrink-0 items-center justify-center">
          {leadingSlot}
        </span>
      )}
      {hasContent(label) && <span data-slot="segmented-control-label">{label}</span>}
      {hasContent(trailingSlot) && (
        <span data-slot="segmented-control-trailing-slot" className="flex shrink-0 items-center justify-center">
          {trailingSlot}
        </span>
      )}
    </ToggleGroupPrimitive.Item>
  )
}
