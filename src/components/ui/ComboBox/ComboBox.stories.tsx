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

const Row = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
    <span style={{ width: 96, fontSize: 12, opacity: 0.6 }}>{label}</span>
    <div style={{ width: 240 }}>{children}</div>
  </div>
)

// Closed control states; the open menu is covered by the MenuOpen story.
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

// react-select portals the open menu to the document body, so leave vertical room.
export const MenuOpen: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 24, minHeight: 320, alignItems: 'flex-start' }}>
      <div style={{ width: 240 }}>
        <ComboBox aria-label='Open' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} placeholder='Select an account' menuIsOpen />
      </div>
      <div style={{ width: 240 }}>
        <ComboBox aria-label='Open selected' options={OPTIONS} selectedValue={OPTIONS[0]} onSelectedValueChange={noop} menuIsOpen />
      </div>
    </div>
  ),
}
