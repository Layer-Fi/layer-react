import { type Meta, type StoryObj } from '@storybook/react-vite'

import { DateTile } from '@ui/DateTile/DateTile'

const meta: Meta<typeof DateTile> = {
  title: 'UI/DateTile',
  component: DateTile,
  args: {
    date: new Date('2026-07-23'),
  },
}

export default meta

type Story = StoryObj<typeof DateTile>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
}

const DATES = [
  new Date('2026-01-01'),
  new Date('2026-07-23'),
  new Date('2026-11-15'),
  new Date('2026-12-31'),
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
