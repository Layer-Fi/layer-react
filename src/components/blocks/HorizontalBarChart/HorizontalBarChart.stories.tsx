import { type Meta, type StoryObj } from '@storybook/react-vite'

import type { SeriesData } from '@ui/Chart/seriesTypes'
import { LegendLayout } from '@ui/Legend/Legend'
import { HorizontalBarChart } from '@blocks/HorizontalBarChart/HorizontalBarChart'

import { Col, Gallery } from '@test-utils/storybook/gallery'

const DATA = {
  data: [
    { name: 'income', displayName: 'Income', value: 6000 },
    { name: 'expenses', displayName: 'Expenses', value: 3500 },
    { name: 'taxes', displayName: 'Taxes', value: 1500 },
  ],
  total: 11000,
}

// The aligned layout is only kept when every segment is at least a quarter of the total;
// anything smaller is downgraded to the table layout.
const BALANCED_DATA = {
  data: [
    { name: 'income', displayName: 'Income', value: 4500 },
    { name: 'expenses', displayName: 'Expenses', value: 4000 },
    { name: 'taxes', displayName: 'Taxes', value: 3500 },
  ],
  total: 12000,
}

const COLORS: Record<string, string> = {
  income: '#2C9F45',
  expenses: '#E5484D',
  taxes: '#F5A623',
}

const colorSelector = (item: SeriesData) => ({
  color: COLORS[item.name] ?? '#EEEEF0',
  opacity: 1,
})

const formatValue = (value: number) => `$${value.toLocaleString()}`

const meta: Meta<typeof HorizontalBarChart<SeriesData>> = {
  title: 'UI/HorizontalBarChart',
  component: HorizontalBarChart,
  args: {
    data: DATA,
    stylingProps: { colorSelector },
    formatValue,
  },
}

export default meta

type Story = StoryObj<typeof HorizontalBarChart<SeriesData>>

const CHART_SIZE = 720

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <Gallery gap={32} inlineSize={CHART_SIZE}>
      <Col label='table legend'>
        <HorizontalBarChart
          data={DATA}
          stylingProps={{ colorSelector }}
          formatValue={formatValue}
          labelMode={LegendLayout.Table}
        />
      </Col>
      <Col label='aligned legend'>
        <HorizontalBarChart
          data={BALANCED_DATA}
          stylingProps={{ colorSelector }}
          formatValue={formatValue}
          labelMode={LegendLayout.Aligned}
        />
      </Col>
      <Col label='aligned requested, small segment forces the table layout'>
        <HorizontalBarChart
          data={DATA}
          stylingProps={{ colorSelector }}
          formatValue={formatValue}
          labelMode={LegendLayout.Aligned}
        />
      </Col>
      <Col label='no legend'>
        <HorizontalBarChart
          data={DATA}
          stylingProps={{ colorSelector }}
          formatValue={formatValue}
          showLegend={false}
        />
      </Col>
    </Gallery>
  ),
}
