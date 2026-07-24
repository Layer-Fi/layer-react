import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Switch } from '@ui/Switch/Switch'

const meta: Meta<typeof Switch> = {
  title: 'UI/Switch',
  component: Switch,
  args: {
    children: 'Label',
  },
  argTypes: {
    isSelected: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Switch>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 96, fontSize: 12, opacity: 0.6 }}>{label}</span>
    {children}
  </div>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <Row label='off'><Switch>Off</Switch></Row>
      <Row label='on'><Switch isSelected>On</Switch></Row>
      <Row label='disabled off'><Switch isDisabled>Disabled</Switch></Row>
      <Row label='disabled on'><Switch isSelected isDisabled>Disabled</Switch></Row>
    </div>
  ),
}
