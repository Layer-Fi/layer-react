import { type Meta, type StoryObj } from '@storybook/react-vite'

import { TextArea } from '@ui/Input/TextArea'

import { Col } from '@testUtils/storybook/layout/Col'
import { Gallery } from '@testUtils/storybook/layout/Gallery'

const VALUE = 'Reconciled against the July payout. Two deposits are still unmatched and will retry overnight.'

const RESIZES = ['none', 'vertical', 'horizontal', 'both'] as const

type Cell = {
  label: string
  props: React.ComponentProps<typeof TextArea>
}

const CELLS: Cell[] = [
  { label: 'placeholder', props: { placeholder: 'Add a note' } },
  { label: 'with value', props: { defaultValue: VALUE } },
  { label: 'disabled', props: { defaultValue: VALUE, disabled: true } },
  { label: 'read only', props: { defaultValue: VALUE, readOnly: true } },
  ...RESIZES.map(resize => ({
    label: `resize ${resize}`,
    props: { defaultValue: VALUE, resize },
  })),
]

const meta: Meta<typeof TextArea> = {
  title: 'UI/TextArea',
  component: TextArea,
  args: {
    placeholder: 'Add a note',
    resize: 'none',
  },
  argTypes: {
    resize: { control: 'inline-radio', options: RESIZES },
    disabled: { control: 'boolean' },
    readOnly: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<typeof TextArea>

const CELL_SIZE = 320

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' wrap gap={24}>
      {CELLS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={CELL_SIZE}>
          <TextArea {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}
