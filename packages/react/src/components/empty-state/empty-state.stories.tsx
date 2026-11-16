import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { Button } from '../button/button'
import { Card } from '../card/card'
import { IconBox } from '../icon-box/icon-box'
import { EmptyState } from './empty-state'

const InboxIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 11l2-6h10l2 6M3 11v4a1 1 0 001 1h12a1 1 0 001-1v-4M3 11h4l1 2h4l1-2h4" />
  </svg>
)

const media = <IconBox icon={<InboxIcon />} />

const copy = {
  title: 'No requests yet',
  description: 'Requests sent through the gateway will show up here.',
}

/** The primary action: `sm` in `inline`, `md` in `page`. */
const primary = (label: string, size: 'sm' | 'md') => <Button size={size}>{label}</Button>
const secondary = (label: string, size: 'sm' | 'md') => (
  <Button tone="default" variant="outline" size={size}>
    {label}
  </Button>
)

const meta = {
  title: 'Components/Empty State',
  component: EmptyState,
  args: { variant: 'inline', ...copy, iconBox: true, action: true },
  argTypes: {
    variant: { control: 'inline-radio', options: ['inline', 'page'] },
    // Switches: on shows an Icon Box / a primary Button, off leaves the slot empty.
    iconBox: { control: 'boolean' },
    action: { control: 'boolean' },
  },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof EmptyState>

export default meta
type Story = StoryObj<typeof meta>

/** One empty state with every property. `iconBox` shows in the `page` variant only. */
export const Playground: Story = {
  render: ({ iconBox, action, ...args }) => (
    <div className="flex h-80 w-full max-w-xl flex-col justify-center rounded-lg border border-dashed border-neutral-subtle">
      <EmptyState
        {...args}
        iconBox={iconBox ? media : undefined}
        action={action ? primary('Create request', args.variant === 'page' ? 'md' : 'sm') : undefined}
      />
    </div>
  ),
}

const rows = [
  { name: 'title', content: { title: copy.title } },
  { name: 'title + description', content: copy },
  { name: 'title + description + action', content: { ...copy, action: 'one' } },
  { name: 'title + description + two actions', content: { ...copy, action: 'two' } },
  { name: 'without iconBox', content: { ...copy, action: 'one' }, noIconBox: true },
] as const

/** The two variants over the five contents of the Figma matrix. `page` fills its cell; `inline` has no iconBox. */
export const Variants: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="grid w-full max-w-4xl grid-cols-[8rem_1fr_1fr] gap-3">
      <span />
      <span className="text-caption text-neutral-subtle">inline</span>
      <span className="text-caption text-neutral-subtle">page</span>
      {rows.map((row) => (
        <div key={row.name} className="contents">
          <span className="text-caption text-neutral-subtle">{row.name}</span>
          {(['inline', 'page'] as const).map((variant) => {
            const size = variant === 'page' ? 'md' : 'sm'
            const { action, ...text } = row.content as { title: string; description?: string; action?: string }
            const cell =
              'noIconBox' in row && variant === 'inline' ? null : (
                <EmptyState
                  variant={variant}
                  {...text}
                  iconBox={'noIconBox' in row ? undefined : media}
                  action={
                    action === 'two' ? (
                      <>
                        {secondary('Learn more', size)}
                        {primary('Create request', size)}
                      </>
                    ) : action === 'one' ? (
                      primary('Create request', size)
                    ) : undefined
                  }
                />
              )
            return (
              <div
                key={variant}
                className="flex h-60 flex-col justify-center rounded-lg border border-dashed border-neutral-subtle"
                data-cell={`${row.name} ${variant}`}
              >
                {cell}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  ),
}

/** Inline fills a card that has no data. */
export const InCard: Story = {
  render: () => (
    <Card className="w-full max-w-md">
      <EmptyState title="No requests match these filters." action={primary('Clear filters', 'sm')} />
    </Card>
  ),
}

/** Page fills the whole empty page: the container sets the height and the content is centered in it. */
export const FullPage: Story = {
  render: () => (
    <div className="h-96 w-full rounded-lg border border-neutral-subtle">
      <EmptyState variant="page" iconBox={media} {...copy} action={primary('Create request', 'md')} />
    </div>
  ),
}

/**
 * **Say what is missing and what to do next**
 * A bare title leaves the user at a dead end. Add a description with the reason and an action when there is one.
 */
export const GuidelineSayWhatIsMissingDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <EmptyState
        title="No API keys yet"
        description="Create a key to start sending requests."
        action={primary('Create key', 'sm')}
      />
    </Specimen>
  ),
}

export const GuidelineSayWhatIsMissingDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <EmptyState title="No data" />
    </Specimen>
  ),
}

/**
 * **Use inline inside a card, page only for a whole page**
 * The page variant adds an Icon Box, a lot of space and a larger button. In a card it pushes the content apart and makes a small area look broken.
 */
export const GuidelineInlineInsideACardDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Card className="w-full max-w-sm">
        <EmptyState title="No requests match these filters." action={primary('Clear filters', 'sm')} />
      </Card>
    </Specimen>
  ),
}

export const GuidelineInlineInsideACardDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Card className="w-full max-w-sm">
        <EmptyState
          variant="page"
          iconBox={media}
          title="No requests match these filters."
          description="Requests sent through the gateway will show up here."
          action={primary('Clear filters', 'md')}
        />
      </Card>
    </Specimen>
  ),
}

/**
 * **Name the action with a verb and an object**
 * The button says what happens when it is pressed. Labels such as Click here or OK tell the user nothing.
 */
export const GuidelineNameTheActionDo: Story = {
  name: 'Guideline 3 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <EmptyState title="No requests match these filters." action={primary('Clear filters', 'sm')} />
    </Specimen>
  ),
}

export const GuidelineNameTheActionDont: Story = {
  name: 'Guideline 3 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <EmptyState title="No requests match these filters." action={primary('Click here', 'sm')} />
    </Specimen>
  ),
}

/**
 * **One primary action, secondary before it**
 * With two buttons only the main one is accent. The secondary is an outline Button placed before it. Two accent buttons make the choice unclear.
 */
export const GuidelineOnePrimaryActionDo: Story = {
  name: 'Guideline 4 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <EmptyState
        title="No API keys yet"
        action={
          <>
            {secondary('Learn more', 'sm')}
            {primary('Create key', 'sm')}
          </>
        }
      />
    </Specimen>
  ),
}

export const GuidelineOnePrimaryActionDont: Story = {
  name: 'Guideline 4 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <EmptyState
        title="No API keys yet"
        action={
          <>
            {primary('Learn more', 'sm')}
            {primary('Create key', 'sm')}
          </>
        }
      />
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
          [GuidelineSayWhatIsMissingDo, GuidelineSayWhatIsMissingDont],
          [GuidelineInlineInsideACardDo, GuidelineInlineInsideACardDont],
          [GuidelineNameTheActionDo, GuidelineNameTheActionDont],
          [GuidelineOnePrimaryActionDo, GuidelineOnePrimaryActionDont],
        ]}
      />
    </>
  )
}
