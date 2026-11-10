import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useRef, useState, type ReactNode } from 'react'
import { CloseIcon, ChevronDownIcon } from '../../lib/icons'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { Field } from '../field/field'
import { Input } from './input'

const iconProps = {
  viewBox: '0 0 16 16',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
} as const

const Search = () => (
  <svg {...iconProps}>
    <circle cx="7" cy="7" r="4.5" />
    <path d="M10.5 10.5L14 14" />
  </svg>
)

const Mail = () => (
  <svg {...iconProps}>
    <rect x="1.75" y="3.5" width="12.5" height="9" rx="1.5" />
    <path d="M2.25 4.5L8 8.75l5.75-4.25" />
  </svg>
)

const Placeholder = () => (
  <svg {...iconProps}>
    <circle cx="8" cy="8" r="5.25" />
  </svg>
)

/** Country picker and prefix for the phone type: a flag stand-in, a chevron and a divider. */
const CountryPrefix = () => (
  <span className="flex items-center gap-1">
    <span className="flex items-center gap-1">
      <span aria-hidden="true" className="h-2.5 w-4 rounded-xs bg-info-emphasized" />
      <ChevronDownIcon />
    </span>
    <span aria-hidden="true" className="h-5 w-px bg-neutral" />
    <span className="text-body-small text-neutral">+1</span>
  </span>
)

const Unit = () => <span className="text-body-small">kg</span>

/**
 * A search field that shows a clear button once there is text to clear, as the filled search state in
 * Figma. The button is ours to compose in `trailingSlot`; Input does not add one.
 */
function ClearableSearch({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  const ref = useRef<HTMLInputElement>(null)
  return (
    <Input
      ref={ref}
      type="search"
      aria-label="Search"
      placeholder="Search"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      leadingSlot={<Search />}
      trailingSlot={
        value ? (
          <button
            type="button"
            aria-label="Clear search"
            className="flex rounded-xs text-neutral-subtle outline-none hover:text-neutral focus-visible:shadow-focus-ring"
            onClick={() => {
              setValue('')
              ref.current?.focus()
            }}
          >
            <CloseIcon />
          </button>
        ) : undefined
      }
    />
  )
}

const meta = {
  title: 'Components/Input',
  component: Input,
  args: { placeholder: 'Placeholder', 'aria-label': 'Example', disabled: false },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

const narrow = [(Story: () => ReactNode) => <div className="w-70">{Story()}</div>]

export const Playground: Story = { decorators: narrow }

type Kind = 'default' | 'search' | 'phone' | 'metric'
type Look = 'default' | 'hover' | 'focus' | 'filled' | 'error' | 'disabled'

const kinds: Kind[] = ['default', 'search', 'phone', 'metric']
const looks: Look[] = ['default', 'hover', 'focus', 'filled', 'error', 'disabled']

// Hover and focus are frozen with the classes the component applies on the real states (the hover fill,
// the focus ring), so the grid shows what a user sees without a `state` prop.
const frozen: Partial<Record<Look, string>> = {
  hover: 'bg-neutral-hover',
  focus: 'shadow-focus-ring',
}

const slots: Record<Kind, { leadingSlot?: ReactNode; trailingSlot?: ReactNode; trailingFilled?: ReactNode }> = {
  default: { leadingSlot: <Placeholder />, trailingSlot: <Placeholder /> },
  search: { leadingSlot: <Search />, trailingFilled: <CloseIcon /> },
  phone: { leadingSlot: <CountryPrefix />, trailingSlot: <Placeholder /> },
  metric: { leadingSlot: <Placeholder />, trailingSlot: <Unit /> },
}

/** Every type in every state. Hover and focus are frozen with classes; the disabled column uses `disabled`. */
export const Variants: Story = {
  render: (args) => (
    <div className="inline-grid grid-cols-[auto_repeat(4,16rem)] items-center gap-x-4 gap-y-3">
      <span />
      {kinds.map((kind) => (
        <span key={kind} className="text-caption text-neutral-subtle">
          {kind}
        </span>
      ))}
      {looks.map((look) => (
        <div key={look} className="contents">
          <span className="text-caption text-neutral-subtle">{look}</span>
          {kinds.map((kind) => {
            const slot = slots[kind]
            return (
              <Input
                key={kind}
                {...args}
                type={kind === 'search' ? 'search' : kind === 'phone' ? 'tel' : undefined}
                aria-label={`${kind}, ${look}`}
                aria-invalid={look === 'error' ? true : undefined}
                disabled={args.disabled || look === 'disabled'}
                defaultValue={look === 'filled' ? 'Value' : undefined}
                className={frozen[look]}
                leadingSlot={slot.leadingSlot}
                trailingSlot={look === 'filled' && slot.trailingFilled ? slot.trailingFilled : slot.trailingSlot}
              />
            )
          })}
        </div>
      ))}
    </div>
  ),
}

/** Leading content, as in the search type. */
export const WithLeading: Story = {
  decorators: narrow,
  args: { type: 'search', placeholder: 'Search', leadingSlot: <Search /> },
}

/** Trailing content, as in the metric type. */
export const WithTrailing: Story = {
  decorators: narrow,
  args: { inputMode: 'decimal', placeholder: '0', trailingSlot: <Unit /> },
}

/** Country picker and prefix before the number, as in the phone type. */
export const Phone: Story = {
  decorators: narrow,
  args: { type: 'tel', placeholder: '(555) 000-0000', leadingSlot: <CountryPrefix />, 'aria-label': 'Phone number' },
}

/** The clear button shows only while the field has text. Type, then clear. */
export const SearchWithClear: Story = {
  decorators: narrow,
  render: () => <ClearableSearch initial="Reflection" />,
}

/** In a Field the label, the caption and the error come from the Field and are wired to the input. */
export const InField: Story = {
  decorators: narrow,
  render: () => (
    <Field label="Email" caption="Used for sign-in only.">
      <Input type="email" placeholder="name@example.com" leadingSlot={<Mail />} />
    </Field>
  ),
}

/** `error` marks the input invalid (`aria-invalid`, danger stroke) and replaces the caption. */
export const InvalidInField: Story = {
  decorators: narrow,
  render: () => (
    <Field label="Email" error="Enter a valid email address.">
      <Input type="email" defaultValue="alex.morgan@.com" leadingSlot={<Mail />} />
    </Field>
  ),
}

export const DisabledInField: Story = {
  decorators: narrow,
  render: () => (
    <Field label="Email" caption="Used for sign-in only." disabled>
      <Input type="email" placeholder="name@example.com" leadingSlot={<Mail />} />
    </Field>
  ),
}

/**
 * **Explain the error in the caption**
 * A red field alone does not say what is wrong. Turn the caption on and write how to fix it.
 */
export const GuidelineExplainTheErrorDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <div className="w-70">
        <Field label="Email" error="Enter a valid email address.">
          <Input defaultValue="alex.morgan@.com" leadingSlot={<Mail />} />
        </Field>
      </div>
    </Specimen>
  ),
}

export const GuidelineExplainTheErrorDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <div className="w-70">
        <Field label="Email">
          <Input aria-invalid defaultValue="alex.morgan@.com" leadingSlot={<Mail />} />
        </Field>
      </div>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side. */
function DocsPage() {
  const rules = [[GuidelineExplainTheErrorDo, GuidelineExplainTheErrorDont]] as const
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
