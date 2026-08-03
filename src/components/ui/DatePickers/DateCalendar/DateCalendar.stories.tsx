import { parseDate } from '@internationalized/date'
import { type Meta, type StoryObj } from '@storybook/react-vite'
import { userEvent, within } from 'storybook/test'

import { DateCalendar } from '@ui/DatePickers/DateCalendar/DateCalendar'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { Col, Gallery } from '@test-utils/storybook/gallery'

// DateCalendar takes no value, so it always opens on the mocked clock's month: December
// of the fixture year. Anchor the range and the hover query to that month.
const VISIBLE_MONTH = `${FIXTURE_YEAR}-12`
const MIN = parseDate(`${VISIBLE_MONTH}-08`)
const MAX = parseDate(`${VISIBLE_MONTH}-24`)

type CalendarProps = React.ComponentProps<typeof DateCalendar>

const CELLS: { label: string, props: CalendarProps }[] = [
  { label: 'default', props: {} },
  { label: 'restricted range', props: { minDate: MIN, maxDate: MAX } },
  { label: 'mobile variant', props: { variant: 'mobile' } },
]

const meta: Meta<CalendarProps> = {
  title: 'UI/DatePickers/DateCalendar',
  component: DateCalendar,
  decorators: [
    Story => (
      <div className='Layer__component'>
        <Story />
      </div>
    ),
  ],
  argTypes: {
    variant: { control: 'inline-radio', options: ['desktop', 'mobile'] },
  },
}

export default meta

type Story = StoryObj<CalendarProps>

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery direction='row' wrap gap={32}>
      {CELLS.map(({ label, props }) => (
        <Col key={label} label={label}>
          <DateCalendar {...props} />
        </Col>
      ))}
    </Gallery>
  ),
}

// Hover is a real pointer state, so it needs its own story: a single calendar keeps the
// cell query unambiguous.
export const Hovered: Story = {
  parameters: { chromatic: { viewports: [1280], delay: 400 } },
  render: () => (
    <Gallery>
      <Col label={`hovered 24 December ${FIXTURE_YEAR}`}>
        <DateCalendar />
      </Col>
    </Gallery>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.hover(await canvas.findByLabelText(new RegExp(`December 24, ${FIXTURE_YEAR}`)))
  },
}
