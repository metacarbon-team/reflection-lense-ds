import { Controls, Description, Primary, Stories, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Item } from '../item'
import {
  Chart,
  ChartPlot,
  ChartPopover,
  ChartStat,
  ChartSwatch,
  ChartTrend,
  type ChartDatum,
  type ChartProps,
  type ChartSeries,
} from './chart'

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

const allDays: ChartDatum[] = rows.map(([error, errorTone, output, uncached, cached], i) => ({
  label: new Date(2026, 9, 17 + i).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  errorBase: errorTone === 'base' ? error : 0,
  errorWarning: errorTone === 'warning' ? error : 0,
  errorDanger: errorTone === 'danger' ? error : 0,
  output,
  uncached,
  cached,
}))

// Stacked from the bottom: errors (neutral base, warning or danger), output, uncached input, cached input.
const series: ChartSeries[] = [
  { key: 'errorBase', tone: 'neutral', emphasis: 'subtle' },
  { key: 'errorWarning', tone: 'warning' },
  { key: 'errorDanger', tone: 'danger' },
  { key: 'output', tone: 'success' },
  { key: 'uncached', tone: 'info' },
  { key: 'cached', tone: 'success', fill: 'hatched' },
]

const days = (count: number) => allDays.slice(0, count)
const num = (d: ChartDatum, key: string) => Number(d[key] ?? 0)
const total = (d: ChartDatum) =>
  ['errorBase', 'errorWarning', 'errorDanger', 'output', 'uncached', 'cached'].reduce(
    (sum, key) => sum + num(d, key),
    0,
  )
const fmt = (n: number) => `${n.toFixed(1)}M`
const formatTick = (n: number) => (n === 0 ? '0' : `${Number(n.toFixed(1))}M`)

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

const PopoverRows = ({ d }: { d: ChartDatum }) => (
  <>
    <Item label="Input (uncached)" metaLabel={fmt(num(d, 'uncached'))} leadingSlot={<ChartSwatch tone="info" />} />
    <Item
      label="Input (cached)"
      metaLabel={fmt(num(d, 'cached'))}
      leadingSlot={<ChartSwatch shape="hatched" tone="success" />}
    />
    <Item label="Output" metaLabel={fmt(num(d, 'output'))} leadingSlot={<ChartSwatch tone="success" />} />
    <Item label="Total" metaLabel={fmt(total(d))} />
    {/* The error series are told apart by color only; this line says it in words for a screen reader. */}
    <span className="sr-only">Errors: {fmt(num(d, 'errorBase') + num(d, 'errorWarning') + num(d, 'errorDanger'))}</span>
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
 * The whole chart: a summary block with the legend on the left, a stacked bar plot on the right, drawn by
 * Recharts. Switch the number of columns in the controls. A column opens its popover on hover and on
 * keyboard focus.
 */
export const Playground: Story = {
  parameters: {
    docs: {
      source: {
        code: `<Chart leadingSlot={
  <ChartStat
    label="Total tokens"
    value="2.7"
    unit="M"
    trend={<ChartTrend value="37.0%" comparison="vs previous 30 days" />}
  >
    <Item label="Input (uncached)" metaLabel="1M" leadingSlot={<ChartSwatch tone="info" />} />
    <Item label="Input (cached)" metaLabel="1.7M" leadingSlot={<ChartSwatch shape="hatched" tone="success" />} />
    <Item label="Output" metaLabel="35.8k" leadingSlot={<ChartSwatch tone="success" />} />
  </ChartStat>
}>
  <ChartPlot
    aria-label="Tokens per day"
    data={[
      { label: 'Oct 17', output: 0.1, uncached: 0.45, cached: 0 },
      { label: 'Oct 18', output: 0.15, uncached: 1.05, cached: 0.45 },
      { label: 'Oct 19', output: 0.15, uncached: 0.8, cached: 1.3 },
    ]}
    series={[
      { key: 'output', tone: 'success' },
      { key: 'uncached', tone: 'info' },
      { key: 'cached', tone: 'success', fill: 'hatched' },
    ]}
    max={4.5}
    formatTick={(value) => (value === 0 ? '0' : \`\${value}M\`)}
    popoverContent={(datum) => (
      <>
        <Item label="Input (uncached)" metaLabel={\`\${datum.uncached}M\`} leadingSlot={<ChartSwatch tone="info" />} />
        <Item label="Input (cached)" metaLabel={\`\${datum.cached}M\`} leadingSlot={<ChartSwatch shape="hatched" tone="success" />} />
        <Item label="Output" metaLabel={\`\${datum.output}M\`} leadingSlot={<ChartSwatch tone="success" />} />
      </>
    )}
  />
</Chart>`,
      },
    },
  },
  render: ({ columns, ...args }) => (
    <div className="w-full overflow-x-auto">
      <Chart {...args} leadingSlot={<Stat />} className={columns === 30 ? 'min-w-400' : undefined}>
        <ChartPlot
          data={days(columns)}
          series={series}
          max={4.5}
          formatTick={formatTick}
          popoverContent={(d) => <PopoverRows d={d} />}
          aria-label={`Tokens per day, ${columns} days`}
        />
      </Chart>
    </div>
  ),
}

const Cell = ({ name, children }: { name: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <span className="text-caption text-neutral-subtle">{name}</span>
    {children}
  </div>
)

/** Chart Plot with 4, 8, 12 and 30 columns, the rows of the Figma matrix. Columns share the width; a bar is at most 64 px wide. One column per plot keeps the hover highlight. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-5xl flex-col gap-6 overflow-x-auto">
      {([4, 8, 12, 30] as const).map((count) => (
        <Cell key={count} name={`columns ${count}`}>
          <div className={count === 30 ? 'min-w-300' : undefined}>
            <ChartPlot
              data={days(count)}
              series={series}
              max={4.5}
              formatTick={formatTick}
              activeIndex={Math.floor(count / 4)}
              aria-label={`Tokens per day, ${count} days`}
              className="h-60"
            />
          </div>
        </Cell>
      ))}
    </div>
  ),
}

const tones = ['neutral', 'info', 'success', 'warning', 'danger'] as const

/** Every tone and fill a bar segment can have, one column per series, including the subtle neutral. */
export const Segments: Story = {
  render: () => {
    const keys = [...tones.map((tone) => ({ key: tone, tone })), { key: 'subtle', tone: 'neutral' as const }]
    const solid = keys.map(({ key, tone }): ChartSeries => ({
      key: `${key}-solid`,
      tone,
      emphasis: key === 'subtle' ? 'subtle' : 'default',
    }))
    const hatched = solid.map((item): ChartSeries => ({
      ...item,
      key: item.key.replace('-solid', '-hatched'),
      fill: 'hatched',
    }))
    const toRows = (items: ChartSeries[]) =>
      items.map((item, i) => ({
        label: item.key.split('-')[0] as string,
        ...Object.fromEntries(items.map((other, j) => [other.key, i === j ? 1 : 0])),
      }))
    return (
      <div className="flex flex-col gap-6">
        <Cell name="solid">
          <ChartPlot
            data={toRows(solid)}
            series={solid}
            max={1}
            ticks={[0, 1]}
            className="h-48 w-120"
            aria-label="Solid segments"
          />
        </Cell>
        <Cell name="hatched">
          <ChartPlot
            data={toRows(hatched)}
            series={hatched}
            max={1}
            ticks={[0, 1]}
            className="h-48 w-120"
            aria-label="Hatched segments"
          />
        </Cell>
      </div>
    )
  },
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
    <ChartPlot
      data={[
        { label: 'Mon', p50: 20, p95: 55 },
        { label: 'Tue', p50: 30, p95: 80 },
        { label: 'Wed', p50: 15, p95: 40 },
        { label: 'Thu', p50: 45, p95: 90 },
      ]}
      range={{ low: 'p50', high: 'p95' }}
      max={100}
      ticks={[0, 25, 50, 75, 100]}
      popoverContent={(d) => (
        <>
          <Item label="p50" metaLabel={String(d.p50)} />
          <Item label="p95" metaLabel={String(d.p95)} />
        </>
      )}
      aria-label="Latency, p50 to p95"
      className="h-60 w-96"
    />
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
    const d = allDays[9] as ChartDatum
    return (
      <ChartPopover label={String(d.label)}>
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
