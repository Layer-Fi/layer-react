import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'

const OPTIONS: ComboBoxOption[] = [
  { label: 'Checking', value: 'checking' },
  { label: 'Savings', value: 'savings' },
  { label: 'Credit card', value: 'credit' },
]

const noop = () => {}

const meta: Meta<typeof ComboBox<ComboBoxOption>> = {
  title: 'UI/ComboBox',
  component: ComboBox,
  args: {
    'aria-label': 'Account',
    'options': OPTIONS,
    'selectedValue': OPTIONS[0],
    'onSelectedValueChange': noop,
    'placeholder': 'Select an account',
  },
  argTypes: {
    isDisabled: { control: 'boolean' },
    isError: { control: 'boolean' },
    isLoading: { control: 'boolean' },
    isClearable: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof ComboBox<ComboBoxOption>>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 96, fontSize: 12, opacity: 0.6 }}>{label}</span>
    <div style={{ width: 240 }}>{children}</div>
  </div>
)

// react-select does not expose a static open prop here, so the gallery shows
// closed control states.
export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24 }}>
      <Row label='placeholder'>
        <ComboBox aria-label='Placeholder' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} placeholder='Select an account' />
      </Row>
      <Row label='selected'>
        <ComboBox aria-label='Selected' options={OPTIONS} selectedValue={OPTIONS[0]} onSelectedValueChange={noop} />
      </Row>
      <Row label='clearable'>
        <ComboBox aria-label='Clearable' options={OPTIONS} selectedValue={OPTIONS[1]} onSelectedValueChange={noop} isClearable />
      </Row>
      <Row label='disabled'>
        <ComboBox aria-label='Disabled' options={OPTIONS} selectedValue={OPTIONS[0]} onSelectedValueChange={noop} isDisabled />
      </Row>
      <Row label='error'>
        <ComboBox aria-label='Error' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} isError slots={{ ErrorMessage: 'Required' }} />
      </Row>
      <Row label='loading'>
        <ComboBox aria-label='Loading' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} isLoading />
      </Row>
    </div>
  ),
}
