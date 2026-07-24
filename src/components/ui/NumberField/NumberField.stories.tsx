import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { NumberField } from '@ui/NumberField/NumberField'
import { Label } from '@ui/Typography/Text'

const meta: Meta<typeof NumberField> = {
  title: 'UI/NumberField',
  component: NumberField,
  args: {
    'aria-label': 'Amount',
    'defaultValue': 42,
  },
  argTypes: {
    inline: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
  },
  render: props => (
    <NumberField {...props}>
      <InputGroup slot='input'>
        <Input inset placeholder='Enter a number' />
      </InputGroup>
    </NumberField>
  ),
}

export default meta

type Story = StoryObj<typeof NumberField>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const Field = ({ label, ...props }: React.ComponentProps<typeof NumberField> & { label: string }) => (
  <NumberField aria-label={label} {...props}>
    <Label slot='label' size='sm' pbe='3xs'>{label}</Label>
    <InputGroup slot='input'>
      <Input inset placeholder='Enter a number' />
    </InputGroup>
  </NumberField>
)

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, maxWidth: 320 }}>
      <Field label='Default' defaultValue={42} />
      <Field label='Empty' />
      <Field label='Read only' defaultValue={42} isReadOnly />
      <Field label='Disabled' defaultValue={42} isDisabled />
      <Field label='Invalid' defaultValue={42} isInvalid />
      <Field label='Inline' defaultValue={42} inline />
    </div>
  ),
}
