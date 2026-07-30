import { type Meta, type StoryObj } from '@storybook/react-vite'

import { Legend, LegendLayout } from '@ui/Legend/Legend'
import type { SeriesData } from '@components/DetailedCharts/types'

import { Col, Gallery } from '@test-utils/storybook/gallery'

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

const total = (items: ReadonlyArray<SeriesData>) =>
  items.reduce((sum, item) => sum + item.value, 0)

const colorSelector = (item: SeriesData) => ({ color: COLORS[item.name], opacity: 1 })
const formatValue = (value: number) => `$${value.toLocaleString()}`

const meta: Meta<typeof Legend<SeriesData>> = {
  title: 'UI/Legend',
  component: Legend,
  args: {
    items: ITEMS,
    total: total(ITEMS),
    colorSelector,
    formatValue,
    layout: LegendLayout.Table,
  },
  argTypes: {
    layout: { control: 'inline-radio', options: Object.values(LegendLayout) },
  },
}

export default meta

type Story = StoryObj<typeof Legend<SeriesData>>

const CELL_SIZE = 480

const CELLS: { label: string, items: ReadonlyArray<SeriesData>, layout: LegendLayout }[] = [
  { label: 'table', items: ITEMS, layout: LegendLayout.Table },
  { label: 'aligned', items: ITEMS, layout: LegendLayout.Aligned },
]

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={32}>
      {CELLS.map(({ label, items, layout }) => (
        <Col key={label} label={label} inlineSize={CELL_SIZE}>
          <Legend
            items={items}
            total={total(items)}
            colorSelector={colorSelector}
            formatValue={formatValue}
            layout={layout}
          />
        </Col>
      ))}
    </Gallery>
  ),
}
