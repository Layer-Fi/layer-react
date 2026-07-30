import { parseDate } from '@internationalized/date'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { DatePicker } from '@components/DatePicker/DatePicker'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const DATE = parseDate('2026-07-23')
const MIN = parseDate('2026-07-08')
const MAX = parseDate('2026-07-29')

const noop = () => {}

type PickerProps = React.ComponentProps<typeof DatePicker<typeof DATE>>

const CELL_SIZE = 260

const CELLS: { label: string, props: Partial<PickerProps> }[] = [
  { label: 'with a date', props: {} },
  { label: 'empty', props: { date: null } },
  { label: 'with a label', props: { showLabel: true } },
  { label: 'read only', props: { isReadOnly: true } },
  { label: 'disabled', props: { isDisabled: true } },
  { label: 'invalid', props: { isInvalid: true, errorText: 'Enter a date in this period' } },
  { label: 'restricted range', props: { minDate: MIN, maxDate: MAX } },
]

const Picker = (props: Partial<PickerProps>) => (
  <DatePicker label='Date' date={DATE} onChange={noop} {...props} />
)

const meta: Meta<PickerProps> = {
  title: 'Date/DatePicker',
  component: DatePicker,
  decorators: [
    Story => (
      <div className='Layer__component'>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Date',
    date: DATE,
    onChange: noop,
    showLabel: false,
  },
  argTypes: {
    showLabel: { control: 'boolean' },
    isReadOnly: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
  },
}

export default meta

type Story = StoryObj<PickerProps>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' wrap gap={32}>
      {CELLS.map(({ label, props }) => (
        <Col key={label} label={label} inlineSize={CELL_SIZE}>
          <Picker {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}

// The popover open state lives inside the component, so it has to be clicked open; a
// single picker keeps the trigger query unambiguous.
export const CalendarOpen: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 400 } },
  render: () => (
    <Gallery minBlockSize={480}>
      <Col label='calendar open' inlineSize={CELL_SIZE}>
        <Picker />
      </Col>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole('button'))
  },
}
