import type { Meta, StoryObj } from '@storybook/react-vite'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  args: { defaultValue: 'color' },
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

/** Line: navigation between pages of the same area. */
export const Line: Story = {
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

/** Pill, small: switching views of the same content. */
export const PillSmall: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="pill" aria-label="Token groups">
        <TabsTrigger value="color">Color</TabsTrigger>
        <TabsTrigger value="type">Type</TabsTrigger>
        <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
}

export const PillLarge: Story = {
  render: (args) => (
    <Tabs {...args}>
      <TabsList variant="pill" size="lg" aria-label="Token groups">
        <TabsTrigger value="color">Color</TabsTrigger>
        <TabsTrigger value="type">Type</TabsTrigger>
        <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
      </TabsList>
      {panels}
    </Tabs>
  ),
}
