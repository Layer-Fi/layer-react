import { type Meta, type StoryObj } from '@storybook/react-vite'

import { AmountInput } from '@ui/Input/AmountInput'

import { Gallery, Row } from '@test-utils/storybook/gallery'

const noop = () => {}

const meta: Meta<typeof AmountInput> = {
  title: 'UI/AmountInput',
  component: AmountInput,
}

export default meta

type Story = StoryObj<typeof AmountInput>

const LABEL_SIZE = 72

const CELLS: { label: string, props: Partial<React.ComponentProps<typeof AmountInput>> }[] = [
  { label: 'empty', props: { value: '' } },
  { label: 'value', props: { value: '1234.56' } },
  { label: 'disabled', props: { value: '1234.56', disabled: true } },
  { label: 'error', props: { value: '0.00', isInvalid: true, errorMessage: 'Amount is required' } },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={16}>
      {CELLS.map(({ label, props }) => (
        <Row key={label} label={label} labelSize={LABEL_SIZE}>
          <AmountInput value='' onChange={noop} {...props} />
        </Row>
      ))}
    </Gallery>
  ),
}
