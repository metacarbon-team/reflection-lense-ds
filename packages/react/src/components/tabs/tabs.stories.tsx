import { Controls, Description, Primary, Stories, Subheading, Title } from '@storybook/addon-docs/blocks'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { Specimen } from '../../docs/specimen'
import { GuidelinePairs } from '../../docs/guideline-pairs'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { defaultValue: 'color' },
  parameters: { docs: { page: DocsPage } },
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

const panels = (
  <>
    <TabsContent value="color" className="text-body-small">
      Color tokens.
    </TabsContent>
    <TabsContent value="type" className="text-body-small">
      Type scale and text roles.
    </TabsContent>
    <TabsContent value="dimensions" className="text-body-small">
      Spacing, sizes and radii.
    </TabsContent>
  </>
)

/** Navigation between pages of the same area, each with its panel. */
export const Default: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList aria-label="Token groups">
        <TabsTrigger value="color">Color</TabsTrigger>
        <TabsTrigger value="type">Type</TabsTrigger>
        <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
        <TabsTrigger value="motion" disabled>
          Motion
        </TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
}

/** Every state of a tab: default, hover, active, focus, disabled. Hover and focus are frozen with `state`. */
export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <Tabs defaultValue="active">
      <TabsList aria-label="Tab states">
        <TabsTrigger value="default">Default</TabsTrigger>
        <TabsTrigger value="hover" state="hover">
          Hover
        </TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="focus" state="focus">
          Focus
        </TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
      </TabsList>
    </Tabs>
  ),
}

const labels = ['Overview', 'Analytics', 'Reports', 'Settings'] as const

// The mistake in a Don't is drawn by hand: Radix lets only one tab be selected, so the second "active"
// look is the same classes the active tab has, put on a tab that is not selected.
const fakeLine =
  'text-neutral after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-t-lg after:bg-current'

/**
 * **Mark exactly one tab as active**  
 * The underline shows which panel is open. Two underlined tabs make the state unclear.
 */
export const GuidelineLineOneActiveDo: Story = {
  name: 'Guideline 1 Do',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="do">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Line: Do, one underlined tab">
          {labels.map((label) => (
            <TabsTrigger key={label} value={label.toLowerCase()}>
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Specimen>
  ),
}

export const GuidelineLineOneActiveDont: Story = {
  name: 'Guideline 1 Don’t',
  tags: ['!autodocs', '!dev'],
  parameters: { layout: 'fullscreen', controls: { disable: true } },
  render: () => (
    <Specimen tone="dont">
      <Tabs defaultValue="overview">
        <TabsList aria-label="Line: Don’t, two underlined tabs">
          {labels.map((label) => (
            <TabsTrigger
              key={label}
              value={label.toLowerCase()}
              className={label === 'Analytics' ? fakeLine : undefined}
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </Specimen>
  ),
}

/** The Docs tab: the usual blocks, then the Do and Don't examples side by side, one pair per rule. */
function DocsPage() {
  const rules = [[GuidelineLineOneActiveDo, GuidelineLineOneActiveDont]] as const
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
