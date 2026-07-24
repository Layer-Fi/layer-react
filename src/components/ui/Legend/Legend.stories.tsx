import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Legend, LegendLayout } from '@ui/Legend/Legend'
import type { SeriesData } from '@components/DetailedCharts/types'

const ITEMS: SeriesData[] = [
  { name: 'income', displayName: 'Income', value: 12000 },
  { name: 'expenses', displayName: 'Expenses', value: 7400 },
  { name: 'taxes', displayName: 'Taxes', value: 2600 },
]

const COLORS: Record<string, string> = {
  income: '#4B8DF8',
  expenses: '#E5484D',
  taxes: '#F5A623',
}

const TOTAL = ITEMS.reduce((sum, item) => sum + item.value, 0)

const colorSelector = (item: SeriesData) => ({ color: COLORS[item.name], opacity: 1 })
const formatValue = (value: number) => `$${value.toLocaleString()}`

const meta: Meta<typeof Legend<SeriesData>> = {
  title: 'UI/Legend',
  component: Legend,
}

export default meta

type Story = StoryObj<typeof Legend<SeriesData>>

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: () => (
    <Legend
      items={ITEMS}
      total={TOTAL}
      colorSelector={colorSelector}
      formatValue={formatValue}
    />
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24, maxWidth: 480 }}>
      <Legend
        items={ITEMS}
        total={TOTAL}
        colorSelector={colorSelector}
        formatValue={formatValue}
        layout={LegendLayout.Table}
      />
      <Legend
        items={ITEMS}
        total={TOTAL}
        colorSelector={colorSelector}
        formatValue={formatValue}
        layout={LegendLayout.Aligned}
      />
    </div>
  ),
}
