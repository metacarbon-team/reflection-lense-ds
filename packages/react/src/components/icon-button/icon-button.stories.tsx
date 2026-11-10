import type { Meta, StoryObj } from '@storybook/react-vite'
import { IconButton } from './icon-button'

const Plus = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
)

const Trash = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V4h6v3" />
  </svg>
)

const meta = {
  title: 'Components/Icon button',
  component: IconButton,
  args: {
    'aria-label': 'Add',
    tone: 'accent',
    variant: 'solid',
    size: 'md',
    state: 'default',
    disabled: false,
    children: <Plus />,
  },
  argTypes: {
    'aria-label': { control: 'text' },
    tone: { control: 'inline-radio', options: ['default', 'accent', 'danger'] },
    variant: { control: 'inline-radio', options: ['solid', 'outline', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    state: { control: 'inline-radio', options: ['default', 'hover', 'pressed', 'focus'] },
    disabled: { control: 'boolean' },
    // `asChild` needs a link as the child, so it is shown in the AsLink story, not toggled here.
    asChild: { control: false },
    children: { control: false },
  },
} satisfies Meta<typeof IconButton>

export default meta
type Story = StoryObj<typeof meta>

/** The icon is picked from a list; `none` hides it, as `?icon` does in Figma. */
export const Playground: Story = {
  args: { children: 'plus' },
  argTypes: {
    children: {
      control: 'select',
      options: ['plus', 'trash', 'none'],
      mapping: { plus: <Plus />, trash: <Trash />, none: null },
      description: 'The icon, passed as `children`.',
    },
  },
}

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
            <IconButton key={tone} {...args} variant={variant} tone={tone} aria-label={`Add, ${tone} ${variant}`} />
          ))}
        </div>
      ))}
    </div>
  ),
}

/** The three diameters: 32, 40 and 48 px, with a 16, 24 and 32 px icon. */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      {sizes.map((size) => (
        <IconButton key={size} {...args} size={size} aria-label={`Add, size ${size}`} />
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
                    <IconButton
                      tone={tone}
                      variant={variant}
                      size={size}
                      state={state === 'disabled' ? 'default' : state}
                      disabled={state === 'disabled'}
                      aria-label={`${tone} ${variant} ${size}, ${state}`}
                    >
                      <Circle />
                    </IconButton>
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

/** A group of icon buttons: one dominant action, the rest `outline` or `ghost`, 8 px apart. */
export const InGroup: Story = {
  render: (args) => (
    <div className="flex items-center gap-2">
      <IconButton {...args} tone="default" variant="ghost" aria-label="Delete">
        <Trash />
      </IconButton>
      <IconButton {...args} tone="accent" variant="solid" aria-label="Add">
        <Plus />
      </IconButton>
    </div>
  ),
}

/** A destructive action: `danger` tone. */
export const Danger: Story = {
  args: { tone: 'danger', variant: 'outline', 'aria-label': 'Delete', children: <Trash /> },
}

/** `disabled` blocks the action and dims the button, in every variant. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div className="flex items-center gap-3">
      {variants.map((variant) => (
        <IconButton key={variant} {...args} variant={variant} aria-label={`Add, ${variant}, disabled`} />
      ))}
    </div>
  ),
}

/** `asChild` renders a link with the icon button styles. A disabled link leaves the Tab order. */
export const AsLink: Story = {
  render: (args) => (
    <div className="flex items-center gap-3">
      <IconButton {...args} asChild aria-label="Open the docs">
        <a href="#docs">
          <Plus />
        </a>
      </IconButton>
      <IconButton {...args} asChild disabled aria-label="Open the docs, disabled">
        <a href="#docs">
          <Plus />
        </a>
      </IconButton>
    </div>
  ),
}
