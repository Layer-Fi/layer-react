import { type Meta, type StoryObj } from '@storybook/react-vite'

import { HorizontalBarChart } from '@ui/HorizontalBarChart/HorizontalBarChart'
import { LegendLayout } from '@ui/Legend/Legend'
import { VStack } from '@ui/Stack/Stack'
import { Span } from '@ui/Typography/Text'
import type { SeriesData } from '@components/DetailedCharts/types'

const DATA = {
  data: [
    { name: 'income', displayName: 'Income', value: 6000 },
    { name: 'expenses', displayName: 'Expenses', value: 3500 },
    { name: 'taxes', displayName: 'Taxes', value: 1500 },
  ],
  total: 11000,
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

export const Playground: Story = {
  parameters: { chromatic: { disableSnapshot: true } },
  render: args => (
    <div style={{ width: 480 }}>
      <HorizontalBarChart {...args} />
    </div>
  ),
}

export const AllVariants: Story = {
  parameters: { chromatic: { viewports: [1280] } },
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: 24, width: 480 }}>
      <VStack gap='sm'>
        <Span size='sm' weight='bold'>Table legend</Span>
        <HorizontalBarChart
          data={DATA}
          stylingProps={{ colorSelector }}
          formatValue={formatValue}
          labelMode={LegendLayout.Table}
        />
      </VStack>
      <VStack gap='sm'>
        <Span size='sm' weight='bold'>Aligned legend</Span>
        <HorizontalBarChart
          data={DATA}
          stylingProps={{ colorSelector }}
          formatValue={formatValue}
          labelMode={LegendLayout.Aligned}
        />
      </VStack>
      <VStack gap='sm'>
        <Span size='sm' weight='bold'>No legend</Span>
        <HorizontalBarChart
          data={DATA}
          stylingProps={{ colorSelector }}
          formatValue={formatValue}
          showLegend={false}
        />
      </VStack>
    </div>
  ),
}
