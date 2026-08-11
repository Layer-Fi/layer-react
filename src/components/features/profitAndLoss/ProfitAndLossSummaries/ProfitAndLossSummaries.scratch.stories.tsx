import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type ProfitAndLossChartColors } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/utils'
import { ProfitAndLossSummaries } from '@features/profitAndLoss/ProfitAndLossSummaries/ProfitAndLossSummaries'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

const CHART_COLORS: ProfitAndLossChartColors = {
  revenue: ['#0B7285', '#1098AD', '#22B8CF', '#66D9E8'],
  expenses: ['#A61E4D', '#D6336C', '#E64980', '#F783AC'],
  uncategorized: '#FFD43B',
}

type ScratchStoryArgs = {
  chartColors?: ProfitAndLossChartColors
}

const meta: Meta<ScratchStoryArgs> = {
  title: 'Scratch/ProfitAndLoss/SummariesColors',
  component: ProfitAndLossSummaries,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    chromatic: { viewports: [1280] },
  },
  decorators: [withProfitAndLossStoryContext({ asContainer: false })],
  render: ({ chartColors }) => (
    <ProfitAndLossSummaries
      reportingVariant={{ type: 'cashflow', showProfitAndLossBreakdown: true }}
      chartColors={chartColors}
    />
  ),
}

export default meta

type Story = StoryObj<ScratchStoryArgs>

export const DefaultColors: Story = {
  name: 'Default colors (baseline)',
}

export const ScopedColors: Story = {
  name: 'Scoped colors per side',
  args: { chartColors: CHART_COLORS },
}
