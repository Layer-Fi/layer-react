import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Toggle } from '@ui/Toggle/Toggle'

const OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  args: {
    ariaLabel: 'Range',
    options: OPTIONS,
    selectedKey: 'day',
  },
  argTypes: {
    fullWidth: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Toggle>

const Col = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    {children}
  </div>
)

const DISABLED_OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week', disabled: true },
  { label: 'Month', value: 'month' },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: 24 }}>
      <Col label='default'>
        <Toggle ariaLabel='default' options={OPTIONS} selectedKey='day' />
      </Col>
      <Col label='full width'>
        <Toggle ariaLabel='full-width' options={OPTIONS} selectedKey='week' fullWidth />
      </Col>
      <Col label='with disabled option'>
        <Toggle ariaLabel='disabled' options={DISABLED_OPTIONS} selectedKey='day' />
      </Col>
    </div>
  ),
}
