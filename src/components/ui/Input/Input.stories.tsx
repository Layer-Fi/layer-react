import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Input } from '@ui/Input/Input'

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  args: {
    placeholder: 'Placeholder',
  },
  argTypes: {
    inset: { control: 'boolean' },
    placement: { control: 'select', options: [undefined, 'first'] },
    disabled: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Input>

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 360 }}>
      <Row label='default'><Input placeholder='Placeholder' /></Row>
      <Row label='value'><Input defaultValue='Typed value' /></Row>
      <Row label='inset'><Input inset placeholder='Inset' /></Row>
      <Row label='disabled'><Input placeholder='Disabled' disabled /></Row>
      <Row label='readonly'><Input defaultValue='Read only' readOnly /></Row>
    </div>
  ),
}
