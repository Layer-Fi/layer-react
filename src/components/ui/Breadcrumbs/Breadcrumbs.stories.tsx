import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Breadcrumb, Breadcrumbs } from '@ui/Breadcrumbs/Breadcrumbs'

const meta: Meta<typeof Breadcrumbs> = {
  title: 'UI/Breadcrumbs',
  component: Breadcrumbs,
}

export default meta

type Story = StoryObj<typeof Breadcrumbs>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <Breadcrumbs>
      <Breadcrumb href='#'>Home</Breadcrumb>
      <Breadcrumb href='#'>Reports</Breadcrumb>
      <Breadcrumb>Profit &amp; Loss</Breadcrumb>
    </Breadcrumbs>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      <Breadcrumbs>
        <Breadcrumb href='#'>Home</Breadcrumb>
        <Breadcrumb>Overview</Breadcrumb>
      </Breadcrumbs>
      <Breadcrumbs>
        <Breadcrumb href='#'>Home</Breadcrumb>
        <Breadcrumb href='#'>Reports</Breadcrumb>
        <Breadcrumb>Profit &amp; Loss</Breadcrumb>
      </Breadcrumbs>
    </div>
  ),
}
