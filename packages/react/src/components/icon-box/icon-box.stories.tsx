import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { GuidelinePairs } from '../../docs/guideline-pairs'
import { Specimen } from '../../docs/specimen'
import { CalendarIcon, ShieldIcon, UserIcon } from '../../lib/icons'
import { IconBox } from './icon-box'

const icons = {
  calendar: <CalendarIcon />,
  shield: <ShieldIcon />,
  user: <UserIcon />,
}

/** A logo mark: the box takes it as it is, so it is drawn at the icon size. */
const LogoMark = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path fill="currentColor" fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 5a3 3 0 110 6 3 3 0 010-6z" />
  </svg>
)

/** An illustration: a few strokes and fills, still 20 px in the box. */
const Illustration = () => (
  <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.25} aria-hidden="true">
    <rect x="3" y="4" width="14" height="12" rx="2" />
    <path d="M3 13l4-4 3 3 3-3 4 4" />
    <circle cx="13.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </svg>
)

const meta = {
  title: 'Components/Icon Box',
  component: IconBox,
  args: { icon: 'calendar' },
  argTypes: {
    icon: { control: 'select', options: Object.keys(icons), mapping: icons },
  },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof IconBox>

export default meta
type Story = StoryObj<typeof meta>

/** One box with an icon. Switch Light and Dark in the toolbar: only the tokens change. */
export const Playground: Story = {}

/** The `icon` slot takes an icon, a logo or an illustration. Each is drawn 20 px inside the 40 px box. */
export const Variants: Story = {
  render: () => (
    <div className="inline-grid grid-cols-[repeat(4,max-content)] items-center gap-x-8 gap-y-3">
      {['icon', 'another icon', 'logo', 'illustration'].map((name) => (
        <span key={name} className="text-caption text-neutral-subtle">
          {name}
        </span>
      ))}
      <IconBox icon={<CalendarIcon />} />
      <IconBox icon={<ShieldIcon />} />
      <IconBox icon={<LogoMark />} />
      <IconBox icon={<Illustration />} />
    </div>
  ),
}

/** The box is decorative by default. Set `aria-label` when the icon means something on its own: the box becomes an image with that name. */
export const Labelled: Story = {
  render: () => <IconBox icon={<ShieldIcon />} aria-label="Protected" />,
}

/**
 * **Keep the icon well inside the box**
 * The icon is 20 px in the 40 px box. An icon that fills the box looks cramped and loses the frame.
 */
export const GuidelineKeepTheIconWellInsideTheBoxDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <IconBox icon={<CalendarIcon />} />
    </Specimen>
  ),
}

export const GuidelineKeepTheIconWellInsideTheBoxDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <IconBox icon={<CalendarIcon />} className="[&_svg:not([class*=size-])]:size-10" />
    </Specimen>
  ),
}

/**
 * **Put one icon in the box**
 * The box holds a single icon. Two icons overflow the frame and read as a different component.
 */
export const GuidelinePutOneIconInTheBoxDo: Story = {
  name: 'Guideline 2 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <IconBox icon={<CalendarIcon />} />
    </Specimen>
  ),
}

export const GuidelinePutOneIconInTheBoxDont: Story = {
  name: 'Guideline 2 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <IconBox
        className="gap-2"
        icon={
          <>
            <CalendarIcon />
            <ShieldIcon />
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
          [GuidelineKeepTheIconWellInsideTheBoxDo, GuidelineKeepTheIconWellInsideTheBoxDont],
          [GuidelinePutOneIconInTheBoxDo, GuidelinePutOneIconInTheBoxDont],
        ]}
      />
    </>
  )
}
