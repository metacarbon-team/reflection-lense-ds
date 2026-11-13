import { Slider as SliderPrimitive } from 'radix-ui'
import { useId, type ComponentProps } from 'react'
import { cn } from '../../lib/cn'
import { useFieldControl } from '../field/field'

const thumbClass = [
  'block size-4 rounded-full border border-neutral bg-card-neutral-emphasized outline-none',
  // Hover belongs to the thumb, not to the whole slider.
  'hover:border-neutral-emphasized focus-visible:shadow-focus-ring',
  // Active: the slider is being pressed or dragged. Both thumbs of a range get the dark ring.
  'group-active:border-current group-active:text-neutral',
]

export type SliderProps = Omit<ComponentProps<typeof SliderPrimitive.Root>, 'orientation' | 'aria-label'> & {
  /**
   * The name of the slider, for assistive tech. Needed when there is no visible label. A range names its
   * thumbs "… minimum" and "… maximum".
   */
  'aria-label'?: string
}

/**
 * Slider: a track, a range fill and one or two thumbs, 176px wide by default. Radix Slider, horizontal only.
 * One value gives a single slider that fills from the left; two values give a range that fills between the
 * thumbs. Pass `value` or `defaultValue` as an array with one or two numbers. Name it with `aria-label`; in a
 * Field it is named by the Field label. Keep the default width: a narrow slider stacks the thumbs.
 */
export function Slider({ className, ...props }: SliderProps) {
  const control = useFieldControl(props)
  const thumbId = useId()
  const values = props.value ?? props.defaultValue ?? [props.min ?? 0]
  const { 'aria-label': label, 'aria-labelledby': labelledBy = control.labelId, ...rootProps } = props
  const range = values.length === 2

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      id={control.attributes.id}
      className={cn('group relative flex h-4 w-44 touch-none items-center select-none', className)}
      {...rootProps}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className="relative h-1.5 grow rounded-full border border-neutral-subtle bg-neutral"
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className="absolute -inset-y-px rounded-full bg-neutral-emphasized"
        />
      </SliderPrimitive.Track>
      {values.map((_, index) => {
        const id = `${thumbId}-${index}`
        const name = range && label ? `${label} ${index === 0 ? 'minimum' : 'maximum'}` : label
        return (
          <SliderPrimitive.Thumb
            key={index}
            id={id}
            data-slot="slider-thumb"
            aria-label={name}
            // A name from the Field label and the thumb's own text, so a range thumb still says which end it is.
            aria-labelledby={labelledBy ? (name ? `${labelledBy} ${id}` : labelledBy) : undefined}
            aria-describedby={control.attributes['aria-describedby']}
            className={cn(thumbClass)}
          />
        )
      })}
    </SliderPrimitive.Root>
  )
}
