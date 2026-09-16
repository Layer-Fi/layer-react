import { type Meta, type StoryObj } from '@storybook/react-vite'

import { DateTile } from '@ui/DateTile/DateTile'

const meta: Meta<typeof DateTile> = {
  title: 'UI/DateTile',
  component: DateTile,
  args: {
    date: new Date('2026-07-23T00:00:00'),
  },
}

export default meta

type Story = StoryObj<typeof DateTile>

// Date-only strings parse as UTC but DateTile formats in local time, which shifts the
// rendered day in negative-offset zones; the time component forces local parsing.
const DATES = [
  new Date('2026-01-01T00:00:00'),
  new Date('2026-07-23T00:00:00'),
  new Date('2026-11-15T00:00:00'),
  new Date('2026-12-31T00:00:00'),
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', gap: 16, padding: 24 }}>
      {DATES.map(date => (
        <DateTile key={date.toISOString()} date={date} />
      ))}
    </div>
  ),
}
