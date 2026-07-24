import { type Meta, type StoryObj } from '@storybook/react-vite'

import { FieldError, Form, TextField } from '@ui/Form/Form'
import { Input } from '@ui/Input/Input'
import { InputGroup } from '@ui/Input/InputGroup'
import { Label } from '@ui/Typography/Text'

const meta: Meta<typeof Form> = {
  title: 'UI/Form',
  component: Form,
}

export default meta

type Story = StoryObj<typeof Form>

const Field = ({
  label,
  ...props
}: React.ComponentProps<typeof TextField> & { label: string }) => (
  <TextField {...props}>
    <Label slot='label' size='sm' pbe='3xs'>{label}</Label>
    <InputGroup slot='input'>
      <Input inset placeholder={label} />
    </InputGroup>
    <FieldError />
  </TextField>
)

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <Form style={{ maxWidth: 320 }}>
      <Field label='Name' />
    </Form>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 48, padding: 24, alignItems: 'flex-start' }}>
      <Form style={{ display: 'flex', flexDirection: 'column', gap: 16, width: 280 }}>
        <Field label='Default' />
        <Field label='With value' defaultValue='Typed value' />
        <Field label='Disabled' defaultValue='Locked' isDisabled />
        <Field label='Invalid' isInvalid />
        <Field label='Inline' inline defaultValue='Inline' />
      </Form>
    </div>
  ),
}
