import { cva, type VariantProps } from 'class-variance-authority'
import { createContext, useContext, useId, type ComponentProps, type CSSProperties, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type DefaultLegendContentProps,
  type TooltipContentProps,
} from 'recharts'
import { cn } from '../../lib/cn'
import { hasContent } from '../../lib/has-content'
import { Card } from '../card/card'
import { Item } from '../item/item'
import { PopoverPanel } from '../popover/popover'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
type Emphasis = 'default' | 'subtle'

// SVG takes fill and stroke, which the theme's utilities (bg, text, border) do not cover, so the chart
// paints with the token variables themselves: in `fill-(--…)` and `stroke-(--…)` classes, and in the
// per-series variables ChartContainer sets. Nothing else is written as a value.

// The color of a series: the token its solid fill uses.
const toneColor = (tone: Tone, emphasis: Emphasis) =>
  tone === 'neutral'
    ? emphasis === 'subtle'
      ? 'var(--fg-neutral-subtle)'
      : 'var(--bg-neutral-emphasized)'
    : `var(--bg-${tone}-emphasized)`

// The pale ground of a hatched mark. In Figma it is the tone with a white film over it, the same in Light and
// Dark, so it is mixed with white here instead of taken from the card surface.
const hatchGround = (tone: Tone, emphasis: Emphasis) => `color-mix(in srgb, ${toneColor(tone, emphasis)} 18%, white)`

// The variables a HatchPattern reads: the line color and the ground of a series.
const hatchVars = (tone: Tone = 'neutral', emphasis: Emphasis = 'default') =>
  ({ '--chart-hatch': toneColor(tone, emphasis), '--chart-hatch-ground': hatchGround(tone, emphasis) }) as CSSProperties

// The hatch of the Figma file: 1.5px lines, 3.2px apart across the stripes, at 45 degrees.
const HATCH_STRIPE = 1.5
const HATCH_PERIOD = 3.2

/** A hatch pattern for SVG: lines in `--chart-hatch` on a ground in `--chart-hatch-ground`, set around it. */
function HatchPattern({ id }: { id: string }) {
  return (
    <pattern
      id={id}
      width={HATCH_PERIOD}
      height={HATCH_PERIOD}
      patternUnits="userSpaceOnUse"
      patternTransform="rotate(45)"
    >
      <rect width={HATCH_PERIOD} height={HATCH_PERIOD} className="fill-(--chart-hatch-ground)" />
      <rect width={HATCH_STRIPE} height={HATCH_PERIOD} className="fill-(--chart-hatch)" />
    </pattern>
  )
}

/**
 * Shared look of a mark: the bar segment and the swatch that names it. One tone per series; `subtle`
 * exists only for `neutral`. A hatched mark draws diagonal lines of its tone on a pale ground of the same tone.
 */
const markVariants = cva('block shrink-0 border', {
  variants: {
    tone: { neutral: '', info: '', success: '', warning: '', danger: '' },
    fill: { solid: '', hatched: '' },
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
  ...props
}: ChartSwatchProps) {
  const patternId = useId()
  return (
    <span
      data-slot="chart-swatch"
      aria-hidden="true"
      className={cn('flex size-4 shrink-0 items-center justify-center', className)}
      {...props}
    >
      {shape === 'square' ? (
        <span className={cn(markVariants({ tone, emphasis, fill: 'solid' }), 'size-4 rounded-sm border-transparent')} />
      ) : shape === 'hatched' ? (
        // The same pattern as the hatched bar segment, so the swatch and the bar always match.
        <svg viewBox="0 0 16 16" className="size-4" style={hatchVars(tone, emphasis)}>
          <defs>
            <HatchPattern id={patternId} />
          </defs>
          <rect
            x={0.5}
            y={0.5}
            width={15}
            height={15}
            fill={`url(#${patternId})`}
            className="stroke-(--chart-hatch) [rx:var(--radius-sm)]"
          />
        </svg>
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

/** One column of the plot: the label under it and one number per series key. */
export type ChartDatum = Record<string, string | number>

/** How one series is named and painted. */
export type ChartSeriesConfig = {
  /** Name of the series in the tooltip and the legend. */
  label?: ReactNode
  /** The series color. */
  tone?: Tone
  /** `default` is the bright tone; `subtle` exists only for `neutral`. */
  emphasis?: Emphasis
  /** `solid` or `hatched`. Use hatched for a secondary series, such as cached input. */
  fill?: 'solid' | 'hatched'
}

/** The series of a chart by data key. ChartContainer turns each into `--color-<key>` for the Recharts parts. */
export type ChartConfig = Record<string, ChartSeriesConfig>

const ChartContext = createContext<{ config: ChartConfig } | null>(null)

/** The config of the chart around the caller. */
export function useChart() {
  const context = useContext(ChartContext)
  if (!context) throw new Error('useChart must be used inside a ChartContainer')
  return context
}

// The look of every Recharts part, from the token variables (see the note at the top): ticks in caption
// text, dashed grid lines, the axis line, the hover column, and no outline of its own on the focusable
// surface, so the container's focus ring is the only one.
const containerClass = [
  'relative w-full min-w-0 rounded-sm has-focus-visible:shadow-focus-ring',
  '[&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none',
  '[&_.recharts-cartesian-axis-tick-value]:fill-current [&_.recharts-cartesian-axis-tick-value]:text-caption [&_.recharts-cartesian-axis-tick-value]:text-neutral-subtle',
  '[&_.recharts-cartesian-grid_line]:stroke-(--stroke-neutral)',
  '[&_.recharts-cartesian-axis-line]:stroke-(--stroke-neutral-emphasized)',
  '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-(--bg-neutral-hover)',
]

export type ChartContainerProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The series by data key: label, tone and fill. Paint a Recharts part with `var(--color-<key>)`. */
  config: ChartConfig
  /** One Recharts chart, such as a BarChart. Name it with `aria-label`: its surface is what takes the focus. */
  children: ComponentProps<typeof ResponsiveContainer>['children']
}

/**
 * Chart Container: the frame for any Recharts chart. It sizes the chart to the container, sets
 * `--color-<key>` for each series of the config (a hatched series gets its pattern), styles the axes,
 * grid and hover column from the theme, and draws the focus ring around the chart. Compose the chart
 * inside it with Recharts parts, ChartTooltip and ChartLegend.
 */
export function ChartContainer({ id, config, className, style, children, ...props }: ChartContainerProps) {
  const uid = useId()
  const chartId = `chart-${(id ?? uid).replace(/:/g, '')}`
  const series = Object.entries(config)
  const colors = Object.fromEntries(
    series.map(([key, item]) => [
      `--color-${key}`,
      item.fill === 'hatched'
        ? `url(#${chartId}-${key})`
        : toneColor(item.tone ?? 'neutral', item.emphasis ?? 'default'),
    ]),
  )
  const hatched = series.filter(([, item]) => item.fill === 'hatched')
  return (
    <ChartContext value={{ config }}>
      <div
        data-slot="chart-container"
        data-chart={chartId}
        className={cn(containerClass, className)}
        style={{ ...colors, ...style } as CSSProperties}
        {...props}
      >
        {hatched.length > 0 && (
          // The patterns of the hatched series; the chart's own svg refers to them by id.
          <svg aria-hidden="true" className="absolute size-0">
            <defs>
              {hatched.map(([key, item]) => (
                <g key={key} style={hatchVars(item.tone, item.emphasis)}>
                  <HatchPattern id={`${chartId}-${key}`} />
                </g>
              ))}
            </defs>
          </svg>
        )}
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext>
  )
}

/** The Recharts Tooltip. Give it a ChartTooltipContent as `content`. */
export const ChartTooltip = Tooltip

export type ChartTooltipContentProps = Partial<TooltipContentProps<number | string, string>> & {
  /** The key of the column label in each datum, for the title. */
  labelKey?: string
  /** Formats each value. */
  formatValue?: (value: number | string, key: string) => ReactNode
  /** Rows after the series, such as a total: Item rows. */
  footer?: (datum: ChartDatum) => ReactNode
}

/**
 * Chart Tooltip Content: the popover of a hovered column. The column label as the title, then one Item
 * row per series with its swatch, name and value, from the chart config.
 */
export function ChartTooltipContent({
  active,
  payload,
  labelKey = 'label',
  formatValue,
  footer,
}: ChartTooltipContentProps) {
  const { config } = useChart()
  const datum = payload?.[0]?.payload as ChartDatum | undefined
  if (!active || !payload?.length || !datum) return null
  return (
    <ChartPopover label={String(datum[labelKey] ?? '')}>
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.name ?? '')
        const item = config[key] ?? {}
        const value = (entry.value ?? '') as number | string
        return (
          <Item
            key={key}
            label={item.label ?? key}
            metaLabel={formatValue ? formatValue(value, key) : String(value)}
            leadingSlot={
              <ChartSwatch
                shape={item.fill === 'hatched' ? 'hatched' : 'square'}
                tone={item.tone}
                emphasis={item.emphasis}
              />
            }
          />
        )
      })}
      {footer?.(datum)}
    </ChartPopover>
  )
}

/** The Recharts Legend. Give it a ChartLegendContent as `content`. */
export const ChartLegend = Legend

/** Chart Legend Content: one row of swatches and series names from the chart config. */
export function ChartLegendContent({ payload }: Pick<DefaultLegendContentProps, 'payload'>) {
  const { config } = useChart()
  if (!payload?.length) return null
  return (
    <div data-slot="chart-legend" className="flex flex-wrap items-center justify-center gap-4 pt-3">
      {payload.map((entry) => {
        const key = String(entry.dataKey ?? entry.value ?? '')
        const item = config[key] ?? {}
        return (
          <span key={key} className="flex items-center gap-1.5 text-caption text-neutral-subtle">
            <ChartSwatch
              shape={item.fill === 'hatched' ? 'hatched' : 'square'}
              tone={item.tone}
              emphasis={item.emphasis}
            />
            {item.label ?? key}
          </span>
        )
      })}
    </div>
  )
}

export type ChartSeries = ChartSeriesConfig & {
  /** The key of the value in each datum. */
  key: string
}

const SEGMENT_GAP = 2
const COLUMN_PADDING = 8
const MAX_BAR_WIDTH = 64

type ShapeBox = { x?: number; y?: number; width?: number; height?: number; payload?: ChartDatum }

// One rectangle of a stack: its series color, a 1px neutral stroke inside the box and a gap of 2px above it.
function SegmentShape({ x = 0, y = 0, width = 0, height = 0, seriesKey }: ShapeBox & { seriesKey: string }) {
  const h = height - SEGMENT_GAP
  if (h <= 0 || width <= 0) return null
  return (
    <rect
      data-slot="chart-segment"
      x={x + 0.5}
      y={y + SEGMENT_GAP + 0.5}
      width={Math.max(width - 1, 0)}
      height={Math.max(h - 1, 0)}
      fill={`var(--color-${seriesKey})`}
      className="stroke-(--stroke-neutral-emphasized) [rx:var(--radius-xs)]"
    />
  )
}

// A p50 to p95 whisker: a line, a cap at p95 and a dot at p50. The bar runs from 0 to p95. Solid, like
// the whisker swatch: the opaque neutral fill token, not a stroke token.
function RangeShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  lowKey,
  highKey,
}: ShapeBox & { lowKey: string; highKey: string }) {
  const high = Number(payload?.[highKey] ?? 0)
  const low = Number(payload?.[lowKey] ?? 0)
  if (height <= 0 || high <= 0) return null
  // Whole pixels plus a half keep the 1px lines sharp instead of blurred over two pixels.
  const center = Math.floor(x + width / 2) + 0.5
  const top = Math.floor(y) + 0.5
  const lowY = y + height - (height * low) / high
  return (
    <g data-slot="chart-range" className="stroke-(--bg-neutral-emphasized)">
      <line x1={center} x2={center} y1={top} y2={lowY} />
      <line x1={center - 4} x2={center + 4} y1={top} y2={top} />
      <circle cx={center} cy={lowY} r={3} className="fill-(--bg-neutral-emphasized) stroke-none" />
    </g>
  )
}

export type ChartPlotProps = Omit<ComponentProps<'div'>, 'children'> & {
  /** The columns, left to right. */
  data: ChartDatum[]
  /** The key of the label under each column. */
  categoryKey?: string
  /** The stacked series, the first one at the bottom. Ignored when `range` is set. */
  series?: ChartSeries[]
  /** Draws a p50 to p95 whisker per column instead of a stack: the keys of both values in each datum. */
  range?: { low: string; high: string }
  /** The value of the top of the plot. */
  max: number
  /** Values of the axis lines, from the bottom to the top. The first one is drawn solid. */
  ticks?: number[]
  /** Formats the axis values. */
  formatTick?: (value: number) => string
  /** Content of the popover of a column: Item rows with a ChartSwatch each. The popover opens on hover and on keyboard focus. */
  popoverContent?: (datum: ChartDatum) => ReactNode
  /** Index of a column that keeps its highlight and popover open, for docs and tests. */
  activeIndex?: number
}

/**
 * Chart Plot: the stacked bar plot of the Figma Chart, built on ChartContainer. Pass the data and the
 * series; it draws the axis lines, a stack or a whisker per column and a popover on hover and focus. Name
 * it with `aria-label`: the chart takes the keyboard focus and shows the focus ring, and the arrow keys
 * move between the columns. For any other chart, compose ChartContainer with Recharts yourself.
 */
export function ChartPlot({
  data,
  categoryKey = 'label',
  series = [],
  range,
  max,
  ticks = [0, max / 3, (max * 2) / 3, max],
  formatTick = String,
  popoverContent,
  activeIndex,
  className,
  'aria-label': ariaLabel,
  ...props
}: ChartPlotProps) {
  const config: ChartConfig = Object.fromEntries(series.map(({ key, ...item }) => [key, item]))
  return (
    <ChartContainer data-slot="chart-plot" config={config} className={cn('h-90', className)} {...props}>
      {/* The name goes on the chart only: its surface is the element that takes the focus. */}
      <BarChart
        data={data}
        aria-label={ariaLabel}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        barCategoryGap={COLUMN_PADDING}
        maxBarSize={MAX_BAR_WIDTH}
      >
        <CartesianGrid vertical={false} strokeDasharray="4 4" />
        <XAxis dataKey={categoryKey} tickLine={false} tickMargin={4} interval="equidistantPreserveStart" />
        <YAxis
          width={40}
          domain={[0, max]}
          ticks={ticks}
          tickFormatter={formatTick}
          tickLine={false}
          axisLine={false}
          tickMargin={8}
        />
        <ChartTooltip
          active={activeIndex === undefined ? undefined : true}
          defaultIndex={activeIndex}
          cursor={{ className: 'recharts-tooltip-cursor [rx:var(--radius-sm)]' }}
          isAnimationActive={false}
          offset={8}
          position={{ y: 0 }}
          content={({ active, payload }) => {
            const datum = payload?.[0]?.payload as ChartDatum | undefined
            if (!active || !datum || !popoverContent) return null
            return <ChartPopover label={String(datum[categoryKey] ?? '')}>{popoverContent(datum)}</ChartPopover>
          }}
        />
        {range ? (
          <Bar
            dataKey={range.high}
            isAnimationActive={false}
            shape={(box: ShapeBox) => <RangeShape {...box} lowKey={range.low} highKey={range.high} />}
          />
        ) : (
          series.map((item) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              stackId="stack"
              isAnimationActive={false}
              shape={(box: ShapeBox) => <SegmentShape {...box} seriesKey={item.key} />}
            />
          ))
        )}
      </BarChart>
    </ChartContainer>
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
