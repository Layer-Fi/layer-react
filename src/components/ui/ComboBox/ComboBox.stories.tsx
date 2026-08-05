import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ComboBox } from '@ui/ComboBox/ComboBox'
import type { ComboBoxOption } from '@ui/ComboBox/types'

import { Gallery } from '@testUtils/storybook/layout/Gallery'
import { Row } from '@testUtils/storybook/layout/Row'

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

const Field = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <Row label={label}>
    <div style={{ inlineSize: 240 }}>{children}</div>
  </Row>
)

// Closed control states; the open menu is covered by the MenuOpen story.
export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={16}>
      <Field label='placeholder'>
        <ComboBox aria-label='Placeholder' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} placeholder='Select an account' />
      </Field>
      <Field label='selected'>
        <ComboBox aria-label='Selected' options={OPTIONS} selectedValue={OPTIONS[0]} onSelectedValueChange={noop} />
      </Field>
      <Field label='clearable'>
        <ComboBox aria-label='Clearable' options={OPTIONS} selectedValue={OPTIONS[1]} onSelectedValueChange={noop} isClearable />
      </Field>
      <Field label='disabled'>
        <ComboBox aria-label='Disabled' options={OPTIONS} selectedValue={OPTIONS[0]} onSelectedValueChange={noop} isDisabled />
      </Field>
      <Field label='error'>
        <ComboBox aria-label='Error' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} isError slots={{ ErrorMessage: 'Required' }} />
      </Field>
      <Field label='loading'>
        <ComboBox aria-label='Loading' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} isLoading />
      </Field>
    </Gallery>
  ),
}

// react-select portals the open menu to the document body, so leave vertical room.
export const MenuOpen: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' gap={48} minBlockSize={320}>
      <div style={{ width: 240 }}>
        <ComboBox aria-label='Open' options={OPTIONS} selectedValue={null} onSelectedValueChange={noop} placeholder='Select an account' menuIsOpen menuPortalTarget={null} />
      </div>
      <div style={{ width: 240 }}>
        <ComboBox aria-label='Open selected' options={OPTIONS} selectedValue={OPTIONS[0]} onSelectedValueChange={noop} menuIsOpen menuPortalTarget={null} />
      </div>
    </Gallery>
  ),
}
