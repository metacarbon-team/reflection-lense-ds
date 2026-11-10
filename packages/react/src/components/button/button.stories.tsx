import { Canvas, Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ReactNode } from 'react'
import { Button } from './button'

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button', tone: 'accent', variant: 'solid', size: 'md', state: 'default', disabled: false },
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'accent', 'danger'] },
    variant: { control: 'inline-radio', options: ['solid', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    state: { control: 'inline-radio', options: ['default', 'hover', 'pressed', 'focus'] },
  },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

const Plus = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <path d="M8 3v10M3 8h10" />
  </svg>
)

const tones = ['default', 'accent', 'danger'] as const
const variants = ['solid', 'outline', 'ghost'] as const
const sizes = ['sm', 'md', 'lg'] as const

/** Every tone and variant at rest. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(3,max-content)] items-center gap-3">
      {variants.map((variant) => (
        <div key={variant} className="contents">
          <span className="text-caption text-neutral-subtle">{variant}</span>
          {tones.map((tone) => (
            <Button key={tone} {...args} variant={variant} tone={tone}>
              {tone}
            </Button>
          ))}
        </div>
      ))}
    </div>
  ),
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <Button key={size} {...args} size={size} leadingSlot={<Plus />}>
          Size {size}
        </Button>
      ))}
    </div>
  ),
}

const Circle = () => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
    <circle cx="8" cy="8" r="5.5" />
  </svg>
)

const matrixStates = ['default', 'hover', 'pressed', 'focus', 'disabled'] as const
const cell = 'flex items-center justify-center border-b border-l border-dashed border-neutral-subtle px-6 py-5'

/** A group label with a bracket on its right edge, as in the Figma matrix. */
function Group({ label, rows, className }: { label: string; rows: number; className?: string }) {
  return (
    <div className={`flex items-center justify-end gap-3 py-2 ${className ?? ''}`} style={{ gridRow: `span ${rows}` }}>
      <span className="text-label text-neutral">{label}</span>
      <span className="h-full w-3 self-stretch rounded-l-sm border-y border-l border-neutral-subtle" />
    </div>
  )
}

/**
 * Every combination of the Figma component set, laid out like its matrix: state, then tone, then
 * variant down the side and size across the top. `hover`, `pressed` and `focus` are frozen with the
 * `state` prop; the last block is `disabled`.
 */
export const States: Story = {
  parameters: { layout: 'padded', controls: { disable: true } },
  render: () => (
    <div className="grid w-full grid-cols-[6rem_7rem_5rem_repeat(3,minmax(0,1fr))] items-stretch">
      {['state', 'tone', 'variant'].map((label) => (
        <span key={label} className="py-3 text-center text-caption text-neutral-subtle">
          {label}
        </span>
      ))}
      {sizes.map((size) => (
        <span key={size} className="py-3 text-center text-label text-neutral">
          {size}
        </span>
      ))}
      {matrixStates.map((state) => (
        <div key={state} className="contents">
          {tones.map((tone, toneIndex) =>
            variants.map((variant, variantIndex) => (
              <div key={`${tone}-${variant}`} className="contents">
                {toneIndex === 0 && variantIndex === 0 && <Group label={state} rows={9} />}
                {variantIndex === 0 && <Group label={tone} rows={3} />}
                <span className="flex items-center justify-end border-t-0 px-3 text-caption text-neutral-subtle">
                  {variant}
                </span>
                {sizes.map((size) => (
                  <div key={size} className={cell}>
                    <Button
                      tone={tone}
                      variant={variant}
                      size={size}
                      state={state === 'disabled' ? 'default' : state}
                      disabled={state === 'disabled'}
                      leadingSlot={<Circle />}
                      trailingSlot={<Circle />}
                    >
                      Button
                    </Button>
                  </div>
                ))}
              </div>
            )),
          )}
        </div>
      ))}
    </div>
  ),
}

/** `leadingSlot` and `trailingSlot` hold 16 × 16 content, usually an icon. They show when they are set. */
export const Slots: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args}>Label only</Button>
      <Button {...args} leadingSlot={<Plus />}>
        Leading
      </Button>
      <Button {...args} trailingSlot={<Plus />}>
        Trailing
      </Button>
      <Button {...args} leadingSlot={<Plus />} trailingSlot={<Plus />}>
        Both
      </Button>
    </div>
  ),
}

/** `asChild` renders a link with the button styles. A disabled link leaves the Tab order. */
export const AsLink: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <Button {...args} asChild leadingSlot={<Plus />}>
        <a href="#docs">Read the docs</a>
      </Button>
      <Button {...args} asChild disabled>
        <a href="#docs">Read the docs</a>
      </Button>
    </div>
  ),
}

/** One side of the guideline: a Do or Don't badge attached to the top, over the live example. */
function Specimen({ tone, children }: { tone: 'do' | 'dont'; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
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

const guideline: Pick<Story, 'tags' | 'parameters'> = {
  tags: ['!autodocs'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
}

/**
 * **Keep Accent as the one dominant action.**  
 * Accent marks the main action, so it must stand out. Never place two Accent buttons inline: pair Accent
 * with Neutral or Ghost. Best practice: one main action per page.
 */
export const GuidelineKeepAccentAsTheOneDominantAction: Story = {
  name: 'Guideline 1',
  ...guideline,
  render: () => (
    <div className="grid grid-cols-2 divide-x divide-neutral-subtle">
      <Specimen tone="do">
        <div className="flex items-center gap-2">
          <Button tone="default" variant="outline" size="sm">
            Cancel
          </Button>
          <Button tone="accent" variant="solid" size="sm">
            Save
          </Button>
        </div>
      </Specimen>
      <Specimen tone="dont">
        <div className="flex items-center gap-2">
          <Button tone="accent" variant="solid" size="sm">
            Cancel
          </Button>
          <Button tone="accent" variant="solid" size="sm">
            Save
          </Button>
        </div>
      </Specimen>
    </div>
  ),
}

/**
 * **Use 8 px gap between buttons in groups.**  
 * Preserve the 8 px gap consistently across button groups.
 */
export const GuidelineUse8PxGapBetweenButtonsInGroups: Story = {
  name: 'Guideline 2',
  ...guideline,
  render: () => (
    <div className="grid grid-cols-2 divide-x divide-neutral-subtle">
      <Specimen tone="do">
        <div className="flex items-center gap-2">
          <Button tone="accent" variant="solid" size="sm">
            Button
          </Button>
          <Button tone="accent" variant="solid" size="sm">
            Button
          </Button>
        </div>
      </Specimen>
      <Specimen tone="dont">
        <div className="flex items-center gap-1">
          <Button tone="accent" variant="solid" size="sm">
            Button
          </Button>
          <Button tone="accent" variant="solid" size="sm">
            Button
          </Button>
        </div>
      </Specimen>
    </div>
  ),
}

/** The Docs tab: the usual blocks, then one Guidelines heading with a title, a subtitle and a panel per rule. */
function DocsPage() {
  const rules = [GuidelineKeepAccentAsTheOneDominantAction, GuidelineUse8PxGapBetweenButtonsInGroups]
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Stories includePrimary={false} />
      <Subheading>Guidelines</Subheading>
      {rules.map((rule, index) => (
        <div key={index}>
          <Description of={rule} />
          <Canvas of={rule} />
        </div>
      ))}
    </>
  )
}
