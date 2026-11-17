import { Controls, Description, Primary, Stories, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { Item } from '../item'
import { Popover, PopoverAnchor, PopoverContent } from '../popover'
import {
  Chart,
  ChartAxisLine,
  ChartBar,
  ChartItems,
  ChartPlot,
  ChartPopover,
  ChartSegment,
  ChartStat,
  ChartSwatch,
  ChartTrend,
  type ChartProps,
} from './chart'

type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger'
type Mark = { tone: Tone; fill?: 'solid' | 'hatched'; emphasis?: 'default' | 'subtle'; value: number }
type Day = { label: string; marks: Mark[]; uncached: number; cached: number; output: number }

// Tokens per day in millions, 17 Oct to 15 Nov, as in the Figma chart. A column is stacked from the
// bottom: errors (warning or danger), output, uncached input, cached input.
type Row = [error: number, errorTone: 'warning' | 'danger' | 'base', output: number, uncached: number, cached: number]
const rows: Row[] = [
  [0.05, 'base', 0, 0, 0],
  [0.05, 'base', 0, 0, 0],
  [0, 'base', 0.1, 0.45, 0],
  [0.05, 'base', 0, 0, 0],
  [0.25, 'warning', 0.1, 0.55, 0.9],
  [0, 'base', 0.15, 1.05, 0.45],
  [0, 'base', 0.15, 0.8, 1.3],
  [0.2, 'danger', 0.25, 1.3, 0.7],
  [0, 'base', 0.15, 1, 1.85],
  [0, 'base', 0.1, 1.55, 1.25],
  [0, 'base', 0.15, 0.9, 1.05],
  [0.3, 'warning', 0.1, 0.75, 0.9],
  [0, 'base', 0.15, 1.25, 0.6],
  [0, 'base', 0.1, 0.3, 0],
  [0.15, 'warning', 0.05, 0.45, 0.3],
  [0.05, 'base', 0, 0, 0],
  [0, 'base', 0.1, 0, 0.1],
  [0.25, 'danger', 0.1, 0.7, 0.95],
  [0, 'base', 0.15, 0.5, 1.5],
  [0.15, 'warning', 0.1, 1, 0.5],
  [0.05, 'base', 0, 0, 0],
  [0.05, 'base', 0, 0, 0],
  [0.35, 'warning', 0.15, 0.8, 1.25],
  [0, 'base', 0.1, 1.1, 0.75],
  [0, 'base', 0.1, 0.3, 0.4],
  [0.05, 'base', 0, 0, 0],
  [0.2, 'danger', 0.1, 0.2, 0],
  [0, 'base', 0.1, 0.55, 0.9],
  [0.25, 'warning', 0.15, 0.85, 0.55],
  [0, 'base', 0.1, 0.45, 0.25],
]

const errorMark = (value: number, tone: Row[1]): Mark =>
  tone === 'base' ? { tone: 'neutral', emphasis: 'subtle', value } : { tone, value }

const allDays: Day[] = rows.map(([error, errorTone, output, uncached, cached], i) => ({
  label: new Date(2026, 9, 17 + i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  uncached,
  cached,
  output,
  marks: [
    ...(error > 0 ? [errorMark(error, errorTone)] : []),
    ...(output > 0 ? [{ tone: 'success', value: output } as Mark] : []),
    ...(uncached > 0 ? [{ tone: 'info', value: uncached } as Mark] : []),
    ...(cached > 0 ? [{ tone: 'success', fill: 'hatched', value: cached } as Mark] : []),
  ],
}))

const days = (count: number) => allDays.slice(0, count)
const total = (d: Day) => d.marks.reduce((sum, m) => sum + m.value, 0)
const fmt = (n: number) => `${n.toFixed(1)}M`
const describe = (d: Day) =>
  `${d.label}: input ${fmt(d.uncached)}, cached input ${fmt(d.cached)}, output ${fmt(d.output)}, total ${fmt(total(d))}`

const Legend = () => (
  <>
    <Item label="Input (uncached)" metaLabel="1M" leadingSlot={<ChartSwatch tone="info" />} />
    <Item label="Input (cached)" metaLabel="1.7M" leadingSlot={<ChartSwatch shape="hatched" tone="success" />} />
    <Item label="Output" metaLabel="35.8k" leadingSlot={<ChartSwatch tone="success" />} />
  </>
)

const Stat = () => (
  <ChartStat
    label="Total tokens"
    value="2.7"
    unit="M"
    trend={<ChartTrend value="37.0%" comparison="vs previous 30 days" />}
  >
    <Legend />
  </ChartStat>
)

const Axes = () => (
  <>
    <ChartAxisLine label="4.5M" />
    <ChartAxisLine label="3M" />
    <ChartAxisLine label="1.5M" />
    <ChartAxisLine label="0" line="solid" />
  </>
)

const DayMarks = ({ marks }: { marks: Mark[] }) => (
  <ChartItems>
    {marks.map((m, i) => (
      <ChartSegment key={i} tone={m.tone} fill={m.fill} emphasis={m.emphasis} value={m.value} />
    ))}
  </ChartItems>
)

const PopoverRows = ({ d }: { d: Day }) => (
  <>
    <Item label="Input (uncached)" metaLabel={fmt(d.uncached)} leadingSlot={<ChartSwatch tone="info" />} />
    <Item
      label="Input (cached)"
      metaLabel={fmt(d.cached)}
      leadingSlot={<ChartSwatch shape="hatched" tone="success" />}
    />
    <Item label="Output" metaLabel={fmt(d.output)} leadingSlot={<ChartSwatch tone="success" />} />
    <Item label="Total" metaLabel={fmt(total(d))} />
  </>
)

type PlaygroundArgs = ChartProps & {
  /** Number of columns in the plot. A control of this story, not a property of Chart. */
  columns: 4 | 8 | 12 | 30
}

const meta = {
  title: 'Components/Chart',
  component: Chart,
  args: { columns: 30 },
  argTypes: {
    columns: { control: 'inline-radio', options: [4, 8, 12, 30] },
  },
  parameters: { docs: { page: DocsPage }, layout: 'padded' },
} satisfies Meta<PlaygroundArgs>

export default meta
type Story = StoryObj<PlaygroundArgs>

/**
 * The whole chart: a summary block with the legend on the left, a stacked bar plot with a time axis
 * on the right. Switch the number of columns in the controls. A column opens its popover on hover and
 * on focus; the columns are buttons here, so the keyboard reaches them.
 */
export const Playground: Story = {
  render: ({ columns, ...args }) => {
    const data = days(columns)
    const [open, setOpen] = useState<number | null>(Math.min(9, columns - 1))
    return (
      <div className="w-full overflow-x-auto">
        <Chart {...args} leadingSlot={<Stat />} className={columns === 30 ? 'min-w-400' : undefined}>
          <ChartPlot max={4.5} axes={<Axes />} aria-label={`Tokens per day, ${columns} days`}>
            {data.map((d, i) => (
              <Popover key={d.label} open={open === i}>
                <PopoverAnchor asChild>
                  <ChartBar
                    label={d.label}
                    state={open === i ? 'hover' : 'default'}
                    role="button"
                    tabIndex={0}
                    aria-label={describe(d)}
                    aria-expanded={open === i}
                    onMouseEnter={() => setOpen(i)}
                    onMouseLeave={() => setOpen(null)}
                    onFocus={() => setOpen(i)}
                    onBlur={() => setOpen(null)}
                  >
                    <DayMarks marks={d.marks} />
                  </ChartBar>
                </PopoverAnchor>
                <PopoverContent
                  side="right"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                  label={d.label}
                  className="w-60"
                >
                  <PopoverRows d={d} />
                </PopoverContent>
              </Popover>
            ))}
          </ChartPlot>
        </Chart>
      </div>
    )
  },
}

const Cell = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="text-caption text-neutral-subtle">{name}</span>
    {children}
  </div>
)

/** Chart Plot with 4, 8, 12 and 30 columns, the rows of the Figma matrix. Columns share the width; a bar is at most 64 px wide. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-5xl flex-col gap-6 overflow-x-auto">
      {([4, 8, 12, 30] as const).map((count) => (
        <Cell key={count} name={`columns ${count}`}>
          <div className={count === 30 ? 'min-w-300' : undefined}>
            <ChartPlot max={4.5} axes={<Axes />} aria-label={`Tokens per day, ${count} days`} className="h-60">
              {days(count).map((d, i) => (
                <ChartBar
                  key={d.label}
                  label={d.label}
                  aria-label={describe(d)}
                  state={i === Math.floor(count / 4) ? 'hover' : 'default'}
                >
                  <DayMarks marks={d.marks} />
                </ChartBar>
              ))}
            </ChartPlot>
          </div>
        </Cell>
      ))}
    </div>
  ),
}

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const

/** Every tone and fill of a bar segment, including the subtle neutral. */
export const BarSegment: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['solid', 'hatched'] as const).map((fill) => (
        <Cell key={fill} name={fill}>
          <div className="flex items-end gap-3">
            {[...tones, 'subtle'].map((tone) => (
              <div key={tone} className="flex flex-col items-center gap-2">
                <ChartPlot max={100} className="h-12 w-20 flex-none">
                  <ChartBar aria-label={`${tone} ${fill}`}>
                    <ChartItems>
                      {tone === 'subtle' ? (
                        <ChartSegment value={100} emphasis="subtle" fill={fill} />
                      ) : (
                        <ChartSegment value={100} tone={tone as (typeof tones)[number]} fill={fill} />
                      )}
                    </ChartItems>
                  </ChartBar>
                </ChartPlot>
                <span className="text-caption text-neutral-subtle">{tone}</span>
              </div>
            ))}
          </div>
        </Cell>
      ))}
    </div>
  ),
}

/** Every shape of a swatch: solid and hatched squares in each tone, the subtle neutral, a dot and a whisker. */
export const Swatch: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      {(['solid', 'hatched'] as const).map((fill) => (
        <Cell key={fill} name={fill}>
          <div className="flex items-center gap-3">
            {tones.map((tone) => (
              <ChartSwatch key={tone} shape={fill === 'solid' ? 'square' : 'hatched'} tone={tone} />
            ))}
            <ChartSwatch shape={fill === 'solid' ? 'square' : 'hatched'} emphasis="subtle" />
          </div>
        </Cell>
      ))}
      <Cell name="dot and whisker">
        <div className="flex gap-3">
          <ChartSwatch shape="dot" />
          <ChartSwatch shape="whisker" />
        </div>
      </Cell>
    </div>
  ),
}

/** The range kind: a p50 to p95 whisker with a dot at p50. */
export const Range: Story = {
  render: () => (
    <ChartPlot max={100} axes={<Axes />} aria-label="Latency, p50 to p95" className="h-60 w-96">
      {[
        { label: 'Mon', low: 20, high: 55 },
        { label: 'Tue', low: 30, high: 80 },
        { label: 'Wed', low: 15, high: 40 },
        { label: 'Thu', low: 45, high: 90 },
      ].map((d) => (
        <ChartBar key={d.label} label={d.label} aria-label={`${d.label}: p50 ${d.low}, p95 ${d.high}`}>
          <ChartItems kind="range" low={d.low} high={d.high} />
        </ChartBar>
      ))}
    </ChartPlot>
  ),
}

/** Trend in both directions, with and without the comparison. */
export const Trend: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <ChartTrend value="37.0%" comparison="vs previous 30 days" />
      <ChartTrend direction="down" value="12.4%" comparison="vs previous 30 days" />
      <ChartTrend value="1.2k" />
    </div>
  ),
}

/** The summary block alone, with and without the unit and the trend. */
export const Stat_: Story = {
  name: 'Chart Stat',
  render: () => (
    <div className="flex gap-8">
      <div className="w-60">
        <Stat />
      </div>
      <div className="w-60">
        <ChartStat label="Requests" value="1,204" />
      </div>
    </div>
  ),
}

/** The popover panel next to a hovered column: the date as the title, a row for each series and a total. */
export const Popover_: Story = {
  name: 'Chart Popover',
  render: () => {
    const d = allDays[9] as Day
    return (
      <ChartPopover label={d.label}>
        <PopoverRows d={d} />
      </ChartPopover>
    )
  },
}

function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
    </>
  )
}
