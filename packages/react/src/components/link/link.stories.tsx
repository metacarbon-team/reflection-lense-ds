import { Canvas, Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Link } from './link'

const ArrowRight = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
)

const External = () => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />
  </svg>
)

/** Icons offered by the Playground slot controls. */
const slotIcons = { none: undefined, arrow: <ArrowRight />, external: <External /> }

const meta = {
  title: 'Components/Link',
  component: Link,
  args: {
    children: 'Link',
    href: '#',
    type: 'inline',
    size: 'md',
    state: 'default',
    disabled: false,
    leadingSlot: 'none',
    trailingSlot: 'none',
  },
  argTypes: {
    type: { control: 'inline-radio', options: ['inline', 'standalone'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    state: { control: 'inline-radio', options: ['default', 'hover', 'pressed', 'focus'] },
    leadingSlot: { control: 'inline-radio', options: ['none', 'arrow', 'external'], mapping: slotIcons },
    trailingSlot: { control: 'inline-radio', options: ['none', 'arrow', 'external'], mapping: slotIcons },
  },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof Link>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = { args: { leadingSlot: 'arrow', trailingSlot: 'arrow' } }

/** Every type and size in each state, then disabled. */
export const States: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(4,max-content)] items-center gap-x-8 gap-y-3">
      {(['default', 'hover', 'pressed', 'focus', 'disabled'] as const).map((state) => (
        <div key={state} className="contents">
          <span className="text-caption text-neutral-subtle">{state}</span>
          {(['inline', 'standalone'] as const).flatMap((type) =>
            (['sm', 'md'] as const).map((size) => (
              <Link
                key={`${type}-${size}`}
                {...args}
                type={type}
                size={size}
                state={state === 'disabled' ? 'default' : state}
                disabled={state === 'disabled'}
                leadingSlot={<ArrowRight />}
                trailingSlot={<ArrowRight />}
              >
                {type} {size}
              </Link>
            )),
          )}
        </div>
      ))}
    </div>
  ),
}

/** An `inline` link sits inside the text and keeps its underline. */
export const InText: Story = {
  render: (args) => (
    <p className="max-w-md text-body">
      Read the <Link {...args}>token rules</Link> before adding a color, or open the{' '}
      <Link {...args} trailingSlot={<External />}>
        Figma file
      </Link>
      .
    </p>
  ),
}

/** A `standalone` link has no underline and stands on its own line. */
export const Standalone: Story = {
  render: (args) => (
    <Link {...args} type="standalone" trailingSlot={<ArrowRight />}>
      Read more
    </Link>
  ),
}

export const WithIcons: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <Link {...args} leadingSlot={<ArrowRight />}>
        Leading
      </Link>
      <Link {...args} trailingSlot={<External />}>
        Trailing
      </Link>
      <Link {...args} leadingSlot={<ArrowRight />} trailingSlot={<External />}>
        Both
      </Link>
    </div>
  ),
}

/** A disabled link has no `href`, ignores clicks and is skipped by Tab. */
export const Disabled: Story = {
  args: { disabled: true },
}

/** `asChild` renders a router link with the link styles. */
export const AsChild: Story = {
  render: (args) => (
    <Link {...args} asChild>
      <a href="#docs">Read the docs</a>
    </Link>
  ),
}

/** A disabled `asChild` link loses the child's `href` too, so it cannot navigate. */
export const DisabledAsChild: Story = {
  render: (args) => (
    <Link {...args} asChild disabled>
      <a href="#docs">Read the docs</a>
    </Link>
  ),
}

/** A Do or Don't badge attached to the top of the card, as in Figma, over the example. */
function Specimen({ tone, children }: { tone: 'do' | 'dont'; children: ReactNode }) {
  return (
    <div className="flex w-full flex-col gap-4">
      <span
        className={
          tone === 'do'
            ? 'm-1 rounded-sm border-b border-success bg-card-success px-2 py-0.5 text-caption text-success uppercase'
            : 'm-1 rounded-sm border-b border-danger bg-card-danger px-2 py-0.5 text-caption text-danger uppercase'
        }
      >
        {tone === 'do' ? 'Do' : 'Don’t'}
      </span>
      <div className="flex justify-center px-6 pb-6">{children}</div>
    </div>
  )
}

/**
 * Keep one size within a group of links. Links placed next to each other use the same size, so the
 * group reads as one set.
 */
export const GuidelineDo: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="flex items-center gap-4">
        <Link type="standalone" size="sm" href="#">
          Terms
        </Link>
        <Link type="standalone" size="sm" href="#">
          Privacy
        </Link>
      </div>
    </Specimen>
  ),
}

/** The second link is larger than the first. */
export const GuidelineDont: Story = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="flex items-center gap-4">
        <Link type="standalone" size="sm" href="#">
          Terms
        </Link>
        <Link type="standalone" size="md" href="#">
          Privacy
        </Link>
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <div className="-mt-2! grid grid-cols-2 gap-x-6 [&_p]:mb-0!">
        <div className="row-span-3 grid grid-rows-subgrid">
          <Description of={GuidelineDo} />
          <Canvas of={GuidelineDo} />
        </div>
        <div className="row-span-3 grid grid-rows-subgrid">
          <Description of={GuidelineDont} />
          <Canvas of={GuidelineDont} />
        </div>
      </div>
    </>
  )
}
