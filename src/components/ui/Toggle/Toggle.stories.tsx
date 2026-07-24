import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Toggle, ToggleSize } from '@ui/Toggle/Toggle'

const OPTIONS = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
]

const SIZES = [ToggleSize.medium, ToggleSize.small, ToggleSize.xsmall]

const meta: Meta<typeof Toggle> = {
  title: 'UI/Toggle',
  component: Toggle,
  args: {
    ariaLabel: 'Range',
    options: OPTIONS,
    selectedKey: 'day',
    size: ToggleSize.medium,
  },
  argTypes: {
    size: { control: 'select', options: SIZES },
    fullWidth: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof Toggle>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

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
      {SIZES.map(size => (
        <Col key={size} label={`size: ${size}`}>
          <Toggle ariaLabel={size} options={OPTIONS} selectedKey='day' size={size} />
        </Col>
      ))}
      <Col label='full width'>
        <Toggle ariaLabel='full-width' options={OPTIONS} selectedKey='week' fullWidth />
      </Col>
      <Col label='with disabled option'>
        <Toggle ariaLabel='disabled' options={DISABLED_OPTIONS} selectedKey='day' />
      </Col>
    </div>
  ),
}
