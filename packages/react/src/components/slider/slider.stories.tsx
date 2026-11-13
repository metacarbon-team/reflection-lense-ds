import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState, type ReactNode } from 'react'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { Field } from '../field/field'
import { Slider } from './slider'

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: { defaultValue: [50], 'aria-label': 'Volume' },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

/** A single slider with one thumb. Pass two values for a range. */
export const Playground: Story = {}

// Freezes a state of the thumbs for the matrix. In use, hover and focus come from the pointer and the
// keyboard, and active from pressing the slider.
const frozen = {
  hover: '[&_[data-slot=slider-thumb]]:border-neutral-emphasized',
  focus: '[&_[data-slot=slider-thumb]]:shadow-focus-ring',
  active: '[&_[data-slot=slider-thumb]]:border-current [&_[data-slot=slider-thumb]]:text-neutral',
}

const Cell = ({ children }: { children: ReactNode }) => (
  <div className="flex h-18 items-center justify-center border border-dashed border-neutral-subtle px-6">
    {children}
  </div>
)
const Head = ({ children }: { children: ReactNode }) => (
  <span className="text-center text-label text-neutral">{children}</span>
)
const Side = ({ children }: { children: ReactNode }) => (
  <span className="pr-4 text-right text-caption text-neutral-subtle">{children}</span>
)

/**
 * Every type and state, as in the Figma matrix. Active is a slider being pressed or dragged: the thumbs get
 * a dark ring. Hover and focus show on the thumb only.
 */
export const Variants: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <span className="text-label-large text-neutral">Slider</span>
        <div className="grid grid-cols-[4rem_repeat(2,14rem)] items-center gap-y-2">
          <Side>type</Side>
          <Head>single</Head>
          <Head>range</Head>
          <Side>default</Side>
          <Cell>
            <Slider aria-label="Single, default" defaultValue={[50]} />
          </Cell>
          <Cell>
            <Slider aria-label="Range, default" defaultValue={[25, 75]} />
          </Cell>
          <Side>active</Side>
          <Cell>
            <Slider aria-label="Single, active" defaultValue={[50]} className={frozen.active} />
          </Cell>
          <Cell>
            <Slider aria-label="Range, active" defaultValue={[25, 75]} className={frozen.active} />
          </Cell>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="text-label-large text-neutral">Slider Thumb</span>
        <div className="grid grid-cols-[4rem_repeat(4,7rem)] items-center gap-y-2">
          <Side>state</Side>
          <Head>default</Head>
          <Head>hover</Head>
          <Head>focus</Head>
          <Head>active</Head>
          <Side>thumb</Side>
          {(['default', 'hover', 'focus', 'active'] as const).map((state) => (
            <Cell key={state}>
              <Slider
                aria-label={`Thumb, ${state}`}
                defaultValue={[0]}
                className={`w-4 ${state === 'default' ? '' : frozen[state]}`}
              />
            </Cell>
          ))}
        </div>
      </div>
    </div>
  ),
}

/** Two values make a range: the fill runs between the thumbs and each thumb is named "minimum" or "maximum". */
export const Range: Story = {
  args: { defaultValue: [25, 75], 'aria-label': 'Price' },
}

const Controlled = () => {
  const [value, setValue] = useState([40])
  return (
    <div className="flex items-center gap-3">
      <Slider aria-label="Brightness" value={value} onValueChange={setValue} />
      <span className="w-8 text-body-small text-neutral-subtle tabular-nums">{value[0]}</span>
    </div>
  )
}

/** Controlled with `value` and `onValueChange`; the number beside it is not part of the slider. */
export const WithValue: Story = {
  parameters: { controls: { disable: true } },
  render: () => <Controlled />,
}

/** Inside a Field the label names the slider and the caption is read with it. */
export const InField: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Field label="Volume" caption="Use the arrow keys for fine steps.">
      <Slider defaultValue={[50]} />
    </Field>
  ),
}

/**
 * **Keep the default width**
 * The slider is 176 px wide. Squeezing it stacks the thumbs on top of each other and makes the value
 * impossible to read or drag.
 */
export const GuidelineKeepTheDefaultWidthDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Slider aria-label="Price, default width" defaultValue={[25, 75]} />
    </Specimen>
  ),
}

export const GuidelineKeepTheDefaultWidthDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Slider aria-label="Price, squeezed" defaultValue={[25, 75]} className="w-17" />
    </Specimen>
  ),
}

/**
 * **Use range for an interval**
 * One range slider with two thumbs selects both ends of an interval. Two separate sliders hide the link
 * between the ends.
 */
export const GuidelineUseRangeForAnIntervalDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Slider aria-label="Price" defaultValue={[25, 75]} />
    </Specimen>
  ),
}

export const GuidelineUseRangeForAnIntervalDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="flex flex-col gap-4">
        <Slider aria-label="Price from" defaultValue={[50]} />
        <Slider aria-label="Price to" defaultValue={[50]} />
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <GuidelinePairs
        rules={[
          [GuidelineKeepTheDefaultWidthDo, GuidelineKeepTheDefaultWidthDont],
          [GuidelineUseRangeForAnIntervalDo, GuidelineUseRangeForAnIntervalDont],
        ]}
      />
    </>
  )
}
