import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, useContext, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { Card } from '../card/card'
import { PopoverPanel } from '../popover/popover'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
type Emphasis = 'default' | 'subtle'

// Color of the hatch lines per tone: the theme variable of the token the solid fill uses.
const hatchColor = (tone: Tone, emphasis: Emphasis) =>
  tone === 'neutral'
    ? emphasis === 'subtle'
      ? 'var(--fg-neutral-subtle)'
      : 'var(--bg-neutral-emphasized)'
    : `var(--bg-${tone}-emphasized)`

const hatchStyle = (tone: Tone, emphasis: Emphasis): CSSProperties => ({
  backgroundImage: `repeating-linear-gradient(135deg, ${hatchColor(tone, emphasis)} 0 3px, transparent 3px 6px)`,
})

/**
 * Shared look of a mark: the bar segment and the swatch that names it. One tone per series; `subtle`
 * exists only for `neutral`. A hatched mark sits on the card surface and draws diagonal lines in its tone.
 */
const markVariants = cva('block shrink-0 border', {
  variants: {
    tone: { neutral: '', info: '', success: '', warning: '', danger: '' },
    fill: { solid: '', hatched: 'bg-card-neutral-emphasized' },
    emphasis: { default: '', subtle: '' },
  },
  compoundVariants: [
    { tone: 'neutral', emphasis: 'default', fill: 'solid', className: 'bg-neutral-emphasized' },
    { tone: 'neutral', emphasis: 'subtle', fill: 'solid', className: 'bg-current text-neutral-subtle' },
    { tone: 'info', fill: 'solid', className: 'bg-info-emphasized' },
    { tone: 'success', fill: 'solid', className: 'bg-success-emphasized' },
    { tone: 'warning', fill: 'solid', className: 'bg-warning-emphasized' },
    { tone: 'danger', fill: 'solid', className: 'bg-danger-emphasized' },
  ],
  defaultVariants: { tone: 'neutral', fill: 'solid', emphasis: 'default' },
})

// The stroke of a hatched swatch: the tone of its lines.
const swatchStroke: Record<Tone, string> = {
  neutral: 'border-neutral-emphasized',
  info: 'border-info-emphasized',
  success: 'border-success-emphasized',
  warning: 'border-warning-emphasized',
  danger: 'border-danger-emphasized',
}

type ChartPlotContextValue = { max: number }
const ChartPlotContext = createContext<ChartPlotContextValue>({ max: 100 })

/** Height of a value as a share of the plot, between 0 and 100 percent. */
const percent = (value: number, max: number) => `${Math.min(100, Math.max(0, (value / max) * 100))}%`

export type ChartProps = Omit<ComponentProps<'div'>, 'content'> & {
  /** The summary block on the left: a ChartStat. The card shows it when it is set. */
  leadingSlot?: ReactNode
  /** The plot on the right: a ChartPlot. It takes all the width that is left. */
  children?: ReactNode
}

/**
 * Chart: the card of a whole chart, a summary block beside a plot. It holds the layout only; the data
 * lives in the parts you put in it.
 */
export function Chart({ leadingSlot, children, className, ...props }: ChartProps) {
  return (
    <Card data-slot="chart" padding="md" className={cn('flex-row gap-6', className)} {...props}>
      {hasContent(leadingSlot) && (
        <div data-slot="chart-leading-slot" className="w-60 shrink-0">
          {leadingSlot}
        </div>
      )}
      <div data-slot="chart-body" className="flex min-w-0 flex-1 flex-col">
        {children}
      </div>
    </Card>
  )
}

export type ChartStatProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** Name of the metric. */
  label: ReactNode
  /** The large number. */
  value: ReactNode
  /** Unit after the value, for example `M` or `k`. */
  unit?: ReactNode
  /** The change under the value: a ChartTrend. The block shows it when it is set. */
  trend?: ReactNode
  /** The legend rows: Item components with a ChartSwatch in each `leadingSlot`. */
  children?: ReactNode
}

/** Chart Stat: the summary block of a chart. A label, a large value with a unit, a trend and the legend. */
export function ChartStat({ label, value, unit, trend, children, className, ...props }: ChartStatProps) {
  return (
    <div data-slot="chart-stat" className={cn('flex min-w-0 flex-col gap-2', className)} {...props}>
      <div className="flex flex-col gap-1 px-3">
        <p data-slot="chart-stat-label" className="text-label text-neutral">
          {label}
        </p>
        <p className="flex items-baseline gap-1 text-neutral">
          <span data-slot="chart-stat-value" className="text-display">
            {value}
          </span>
          {hasContent(unit) && (
            <span data-slot="chart-stat-unit" className="text-body-large-medium text-neutral-subtle">
              {unit}
            </span>
          )}
        </p>
        {hasContent(trend) && trend}
      </div>
      {hasContent(children) && (
        <div data-slot="chart-stat-items" className="flex flex-col">
          {children}
        </div>
      )}
    </div>
  )
}

const trendVariants = cva('flex items-center gap-1 text-label-small', {
  variants: { direction: { up: 'text-success-subtle', down: 'text-danger' } },
  defaultVariants: { direction: 'up' },
})

export type ChartTrendProps = Omit<ComponentProps<'p'>, 'children'> &
  VariantProps<typeof trendVariants> & {
    /** The direction of the change. `up` is green, `down` is red; the arrow and a hidden word say it too. */
    direction?: 'up' | 'down'
    /** Percentage or absolute change, for example `37.0%`. */
    value: ReactNode
    /** The period the change is measured against, for example `vs previous 30 days`. Shown when it is set. */
    comparison?: ReactNode
  }

/** Chart Trend: the change against the previous period, an arrow and a value. */
export function ChartTrend({ direction = 'up', value, comparison, className, ...props }: ChartTrendProps) {
  return (
    <p data-slot="chart-trend" className={cn(trendVariants({ direction }), className)} {...props}>
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="size-3 shrink-0"
      >
        {direction === 'up' ? <path d="M4 12L12 4M6 4h6v6" /> : <path d="M4 4l8 8M12 6v6H6" />}
      </svg>
      <span className="sr-only">{direction === 'up' ? 'Up' : 'Down'}</span>
      <span>{value}</span>
      {hasContent(comparison) && <span className="text-body-small text-neutral-subtle">{comparison}</span>}
    </p>
  )
}

export type ChartSwatchProps = Omit<ComponentProps<'span'>, 'children'> &
  Omit<VariantProps<typeof markVariants>, 'fill'> & {
    /**
     * The shape of the marker. `square` and `hatched` match the bar segments; `dot` and `whisker` mark
     * p50 and p95 and stay neutral.
     */
    shape?: 'square' | 'hatched' | 'dot' | 'whisker'
    /** The series color. Use the same tone as the bar segment it names. */
    tone?: Tone
    /** `default` is the bright tone; `subtle` exists only for `neutral`. */
    emphasis?: Emphasis
  }

/**
 * Chart Swatch: a 16 × 16 legend marker. It is decorative: the legend row beside it carries the name,
 * so the marker is hidden from assistive technology.
 */
export function ChartSwatch({
  shape = 'square',
  tone = 'neutral',
  emphasis = 'default',
  className,
  style,
  ...props
}: ChartSwatchProps) {
  const isMark = shape === 'square' || shape === 'hatched'
  return (
    <span
      data-slot="chart-swatch"
      aria-hidden="true"
      className={cn('flex size-4 shrink-0 items-center justify-center', className)}
      {...props}
    >
      {isMark ? (
        <span
          className={cn(
            markVariants({ tone, emphasis, fill: shape === 'hatched' ? 'hatched' : 'solid' }),
            shape === 'hatched' ? swatchStroke[tone] : 'border-transparent',
            'size-4 rounded-sm',
          )}
          style={{ ...(shape === 'hatched' ? hatchStyle(tone, emphasis) : undefined), ...style }}
        />
      ) : shape === 'dot' ? (
        <span className="size-1.5 rounded-full bg-neutral-emphasized" />
      ) : (
        <span className="flex w-2 flex-col items-center">
          <span className="h-0.5 w-full rounded-xs bg-neutral-emphasized" />
          <span className="h-2 w-0.5 bg-neutral-emphasized" />
        </span>
      )}
    </span>
  )
}

export type ChartAxisLineProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** `dashed` for grid lines, `solid` for the baseline. */
  line?: 'dashed' | 'solid'
  /** Value shown at the left end of the line. Shown when it is set. */
  label?: ReactNode
}

/** Chart Axis Line: a horizontal grid line with an optional value label. It is decoration; the bars carry the data. */
export function ChartAxisLine({ line = 'dashed', label, className, ...props }: ChartAxisLineProps) {
  return (
    <div data-slot="chart-axis-line" aria-hidden="true" className={cn('flex h-0 items-center', className)} {...props}>
      <span data-slot="chart-axis-label" className="w-10 shrink-0 pr-2 text-end text-caption text-neutral-subtle">
        {label}
      </span>
      <span
        className={cn(
          'flex-1 border-t',
          line === 'dashed' ? 'border-dashed border-neutral' : 'border-neutral-emphasized',
        )}
      />
    </div>
  )
}

export type ChartPlotProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The value of the top of the plot. A segment or a whisker is as tall as its value is a share of it. */
  max?: number
  /** Axis lines, drawn from top to bottom in equal steps. End with a `solid` baseline. */
  axes?: ReactNode
  /** The columns: ChartBar components. They share the width equally. */
  children?: ReactNode
}

/**
 * Chart Plot: the plot area. The axes sit behind a row of columns. It is a labeled group: give it an
 * `aria-label` that says what the chart shows, and give each column its own `aria-label` with the values.
 */
export function ChartPlot({ max = 100, axes, children, className, ...props }: ChartPlotProps) {
  return (
    <ChartPlotContext.Provider value={{ max }}>
      <div data-slot="chart-plot" role="group" className={cn('relative h-90 w-full min-w-0', className)} {...props}>
        <div className="absolute inset-x-0 top-0 bottom-4 flex flex-col justify-between">{axes}</div>
        <div className="relative flex h-full pl-10">{children}</div>
      </div>
    </ChartPlotContext.Provider>
  )
}

const barAreaVariants = cva('relative flex-1 rounded-sm outline-none focus-visible:shadow-focus-ring', {
  variants: {
    state: {
      default: 'group-hover/bar:bg-neutral-hover',
      hover: 'bg-neutral-hover',
    },
  },
  defaultVariants: { state: 'default' },
})

export type ChartBarProps = ComponentProps<'div'> & {
  /** `hover` freezes the highlight of the bar area for docs and tests. The label is never highlighted. */
  state?: 'default' | 'hover'
  /** Text under the bar, usually the date. One line, centered under the bar; it may be wider than the column, so label only every few columns of a dense plot. Shown when it is set. */
  label?: ReactNode
  /** The data marks of the column: a ChartItems. */
  children?: ReactNode
}

/**
 * Chart Bar: one column of the plot, a hover area with a label under it. The marks come from the
 * ChartItems inside. The column is an image with a name: set `aria-label` to the label and the values,
 * for example "Oct 26: input 1M, output 35.8k". To open a popover from it, set `role="button"` and
 * `tabIndex={0}` yourself.
 */
export function ChartBar({ state = 'default', label, children, className, role = 'img', ...props }: ChartBarProps) {
  return (
    <div data-slot="chart-bar" className={cn('group/bar flex min-w-0 flex-1 flex-col', className)}>
      <div data-slot="chart-bar-area" role={role} className={barAreaVariants({ state })} {...props}>
        {children}
      </div>
      <span
        data-slot="chart-bar-label"
        aria-hidden="true"
        className="flex h-4 justify-center text-caption whitespace-nowrap text-neutral-subtle"
      >
        {label}
      </span>
    </div>
  )
}

export type ChartItemsProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** `stack` holds colored segments; `range` draws a p50 to p95 whisker with a dot. */
  kind?: 'stack' | 'range'
  /** `range` only: the p50 value, where the dot sits. */
  low?: number
  /** `range` only: the p95 value, where the whisker ends. */
  high?: number
  /** `stack` only: ChartSegment components, the first one at the bottom. */
  children?: ReactNode
}

/** Chart Items: the data marks of one column. Lay it over the bar area of a ChartBar. */
export function ChartItems({ kind = 'stack', low = 0, high = 0, children, className, ...props }: ChartItemsProps) {
  const { max } = useContext(ChartPlotContext)
  if (kind === 'range') {
    return (
      <div data-slot="chart-items" data-kind="range" className={cn('absolute inset-0', className)} {...props}>
        <span
          className="absolute left-1/2 w-px -translate-x-1/2 bg-neutral-emphasized"
          style={{ bottom: percent(low, max), height: percent(Math.max(high - low, 0), max) }}
        />
        <span
          className="absolute left-1/2 h-px w-2 -translate-x-1/2 bg-neutral-emphasized"
          style={{ bottom: percent(high, max) }}
        />
        <span
          className="absolute left-1/2 size-1.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-neutral-emphasized"
          style={{ bottom: percent(low, max) }}
        />
      </div>
    )
  }
  return (
    <div
      data-slot="chart-items"
      data-kind="stack"
      className={cn('absolute inset-0 flex flex-col-reverse items-center gap-0.5 px-2', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export type ChartSegmentProps = Omit<ComponentProps<'span'>, 'children'> &
  Omit<VariantProps<typeof markVariants>, 'tone' | 'emphasis'> & {
    /** The data value. The height of the segment is its share of the plot `max`. */
    value: number
    /** `solid` or `hatched`. Use hatched for a secondary series, such as cached input. */
    fill?: 'solid' | 'hatched'
    /** The series color. */
    tone?: Tone
    /** `default` is the bright tone; `subtle` exists only for `neutral`. */
    emphasis?: Emphasis
  }

/** Chart Segment: one rectangle of a stack. Its height is the data value; it is at most 64 px wide. */
export function ChartSegment({
  value,
  fill = 'solid',
  tone = 'neutral',
  emphasis = 'default',
  className,
  style,
  ...props
}: ChartSegmentProps) {
  const { max } = useContext(ChartPlotContext)
  return (
    <span
      data-slot="chart-segment"
      className={cn(
        markVariants({ tone, emphasis, fill }),
        'w-full max-w-16 rounded-xs border-neutral-emphasized',
        className,
      )}
      style={{
        height: percent(value, max),
        ...(fill === 'hatched' ? hatchStyle(tone, emphasis) : undefined),
        ...style,
      }}
      {...props}
    />
  )
}

export type ChartPopoverProps = Omit<ComponentProps<'div'>, 'content' | 'children'> & {
  /** The title of the popover, usually the date of the hovered column. */
  label: ReactNode
  /** The rows: Item components with a ChartSwatch in each `leadingSlot`, one per series plus a total. */
  children?: ReactNode
}

/**
 * Chart Popover: the panel next to a hovered column. It is the surface of a Popover panel, 240 px wide:
 * put it in a PopoverContent, or place it yourself.
 */
export function ChartPopover({ label, children, className, ...props }: ChartPopoverProps) {
  return (
    <PopoverPanel data-slot="chart-popover" label={label} className={cn('w-60 gap-2', className)} {...props}>
      {children}
    </PopoverPanel>
  )
}
