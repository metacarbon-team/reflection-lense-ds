import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ComponentProps } from 'react'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { Breadcrumb, BreadcrumbEllipsis, BreadcrumbItem, BreadcrumbSeparator } from './breadcrumb'

const DotIcon = () => (
  <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
    <circle cx="6" cy="6" r="1.5" />
  </svg>
)

type PlaygroundArgs = ComponentProps<typeof Breadcrumb> & {
  /** State of the last item. `active` is the current page. */
  state: ComponentProps<typeof BreadcrumbItem>['state']
  /** The glyph between the items. */
  separator: 'chevron' | 'dot'
  /** Collapses the middle of the path into a "…" mark. */
  ellipsis: boolean
}

const meta = {
  title: 'Components/Breadcrumb',
  component: Breadcrumb,
  subcomponents: { BreadcrumbItem, BreadcrumbSeparator, BreadcrumbEllipsis },
  args: { 'aria-label': 'Breadcrumb', state: 'active', separator: 'chevron', ellipsis: false },
  argTypes: {
    // Playground-only controls: they set up the example and are not props of Breadcrumb.
    state: {
      control: 'inline-radio',
      options: ['default', 'hover', 'active'],
      description: 'State of the last item: `active` is the current page, `hover` freezes the hover look.',
      table: { category: 'Playground', type: { summary: "'default' | 'hover' | 'active'" } },
    },
    separator: {
      control: 'inline-radio',
      options: ['chevron', 'dot'],
      description: 'The glyph between the items.',
      table: { category: 'Playground', type: { summary: "'chevron' | 'dot'" } },
    },
    ellipsis: {
      control: 'boolean',
      description: 'Collapses the middle of the path into a "…" mark.',
      table: { category: 'Playground' },
    },
  },
  parameters: { docs: { page: DocsPage } },
  render: ({ state, separator, ellipsis, ...args }) => {
    const sep = separator === 'dot' ? <DotIcon /> : undefined
    return (
      <Breadcrumb {...args}>
        <BreadcrumbItem label="Home" href="#" />
        <BreadcrumbSeparator>{sep}</BreadcrumbSeparator>
        {ellipsis ? (
          <>
            <BreadcrumbEllipsis />
            <BreadcrumbSeparator>{sep}</BreadcrumbSeparator>
          </>
        ) : null}
        <BreadcrumbItem label="Components" href="#" />
        <BreadcrumbSeparator>{sep}</BreadcrumbSeparator>
        <BreadcrumbItem label="Breadcrumb" href="#" state={state} />
      </Breadcrumb>
    )
  },
} satisfies Meta<PlaygroundArgs>

export default meta
type Story = StoryObj<typeof meta>

/** A path of three levels. The last item is the current page; the controls change its state, the separator and the "…" mark. */
export const Playground: Story = {}

const itemStates = ['default', 'hover', 'active'] as const

/** Every item state, then the path with a chevron, with a dot and with the "…" mark. Hover is frozen with `state`. */
export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[auto_repeat(3,max-content)] items-center gap-x-8 gap-y-4">
      <span />
      {itemStates.map((state) => (
        <span key={state} className="text-caption text-neutral-subtle">
          {state}
        </span>
      ))}
      <span className="text-caption text-neutral-subtle">item</span>
      {itemStates.map((state) => (
        <Breadcrumb key={state} aria-label={`Item, ${state}`}>
          <BreadcrumbItem label="Label" href="#" state={state} />
        </Breadcrumb>
      ))}
      <span className="text-caption text-neutral-subtle">chevron</span>
      <div className="col-span-3">
        <Breadcrumb aria-label="Chevron separator">
          <BreadcrumbItem label="Home" href="#" />
          <BreadcrumbSeparator />
          <BreadcrumbItem label="Components" href="#" />
          <BreadcrumbSeparator />
          <BreadcrumbItem label="Breadcrumb" state="active" />
        </Breadcrumb>
      </div>
      <span className="text-caption text-neutral-subtle">dot</span>
      <div className="col-span-3">
        <Breadcrumb aria-label="Dot separator">
          <BreadcrumbItem label="Home" href="#" />
          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem label="Components" href="#" />
          <BreadcrumbSeparator>
            <DotIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem label="Breadcrumb" state="active" />
        </Breadcrumb>
      </div>
      <span className="text-caption text-neutral-subtle">ellipsis</span>
      <div className="col-span-3">
        <Breadcrumb aria-label="Collapsed path">
          <BreadcrumbItem label="Home" href="#" />
          <BreadcrumbSeparator />
          <BreadcrumbEllipsis />
          <BreadcrumbSeparator />
          <BreadcrumbItem label="Components" href="#" />
          <BreadcrumbSeparator />
          <BreadcrumbItem label="Breadcrumb" state="active" />
        </Breadcrumb>
      </div>
    </div>
  ),
}

/** A long path: keep the first item, the "…" mark and the last two levels. */
export const CollapsedPath: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem label="Home" href="#" />
      <BreadcrumbSeparator />
      <BreadcrumbEllipsis />
      <BreadcrumbSeparator />
      <BreadcrumbItem label="Components" href="#" />
      <BreadcrumbSeparator />
      <BreadcrumbItem label="Breadcrumb" state="active" />
    </Breadcrumb>
  ),
}

/** A dot instead of the chevron. Use one glyph for the whole path. */
export const DotSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem label="Home" href="#" />
      <BreadcrumbSeparator>
        <DotIcon />
      </BreadcrumbSeparator>
      <BreadcrumbItem label="Components" href="#" />
      <BreadcrumbSeparator>
        <DotIcon />
      </BreadcrumbSeparator>
      <BreadcrumbItem label="Breadcrumb" state="active" />
    </Breadcrumb>
  ),
}

/** With a router, `asChild` gives the item's look to the router link; the link's own text becomes the label. */
export const AsChild: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbItem label="Home" asChild>
        <a href="#home" />
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem label="Components" asChild>
        <a href="#components" />
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem label="Breadcrumb" state="active" />
    </Breadcrumb>
  ),
}

/**
 * **Collapse long paths with an ellipsis item.**
 * Keep the first item, the “…” mark and the last two levels. A long trail wraps or overflows and hides where the user is.
 */
export const GuidelineCollapseLongPathsDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Breadcrumb>
        <BreadcrumbItem label="Home" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbEllipsis />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Components" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Breadcrumb" state="active" />
      </Breadcrumb>
    </Specimen>
  ),
}

export const GuidelineCollapseLongPathsDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Breadcrumb>
        <BreadcrumbItem label="Home" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Docs" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Guides" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Setup" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Install" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Linux" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Ubuntu" state="active" />
      </Breadcrumb>
    </Specimen>
  ),
}

/**
 * **Use one separator type per breadcrumb.**
 * Mixing glyphs makes the trail look broken. Pick chevron or dot and keep it across the whole path.
 */
export const GuidelineOneSeparatorDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Breadcrumb>
        <BreadcrumbItem label="Home" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Components" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Breadcrumb" state="active" />
      </Breadcrumb>
    </Specimen>
  ),
}

export const GuidelineOneSeparatorDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Breadcrumb>
        <BreadcrumbItem label="Home" href="#" />
        <BreadcrumbSeparator>
          <DotIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem label="Components" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Guides" href="#" />
        <BreadcrumbSeparator>
          <DotIcon />
        </BreadcrumbSeparator>
        <BreadcrumbItem label="Breadcrumb" state="active" />
      </Breadcrumb>
    </Specimen>
  ),
}

/**
 * **Keep item labels short.**
 * Use one or two words that match the page title. Long labels push the trail past its container.
 */
export const GuidelineShortLabelsDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Breadcrumb>
        <BreadcrumbItem label="Home" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Guides" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Install" state="active" />
      </Breadcrumb>
    </Specimen>
  ),
}

export const GuidelineShortLabelsDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Breadcrumb>
        <BreadcrumbItem label="Home" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="Guides" href="#" />
        <BreadcrumbSeparator />
        <BreadcrumbItem label="How to install and configure the design system for your team" state="active" />
      </Breadcrumb>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  const rules = [
    [GuidelineCollapseLongPathsDo, GuidelineCollapseLongPathsDont],
    [GuidelineOneSeparatorDo, GuidelineOneSeparatorDont],
    [GuidelineShortLabelsDo, GuidelineShortLabelsDont],
  ] as const
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      <GuidelinePairs rules={rules} />
    </>
  )
}
