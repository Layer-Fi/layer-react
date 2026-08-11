import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ProfitAndLossDetailedCharts } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/ProfitAndLossDetailedCharts'
import { type ProfitAndLossChartColors } from '@features/profitAndLoss/ProfitAndLossDetailedCharts/utils'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { makeProfitAndLossReport } from '@fixtures/profitAndLoss/mocks'
import { makeLineItem } from '@fixtures/profitAndLoss/utils'
import { get as getProfitAndLossReport } from '@msw/api/businesses/[business-id]/reports/profit-and-loss/get'
import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

const reportWithUncategorized = {
  ...makeProfitAndLossReport({
    startDate: new Date(FIXTURE_YEAR, 8, 1),
    endDate: new Date(FIXTURE_YEAR, 8, 30),
  }),
  uncategorizedInflows: makeLineItem('UNCATEGORIZED_INFLOWS', 'Uncategorized Inflows', 420_000),
  uncategorizedOutflows: makeLineItem('UNCATEGORIZED_OUTFLOWS', 'Uncategorized Outflows', 310_000),
}

const CHART_COLORS: ProfitAndLossChartColors = {
  revenue: ['#0B7285', '#1098AD', '#22B8CF', '#66D9E8'],
  expenses: ['#A61E4D', '#D6336C', '#E64980', '#F783AC'],
  uncategorized: '#FFD43B',
}

type ScratchStoryArgs = {
  scope: 'revenue' | 'expenses'
  chartColors?: ProfitAndLossChartColors
}

const meta: Meta<ScratchStoryArgs> = {
  title: 'Scratch/ProfitAndLoss/DetailedChartsColors',
  component: ProfitAndLossDetailedCharts,
  parameters: {
    msw: {
      handlers: [
        getProfitAndLossReport.mock(reportWithUncategorized),
        ...profitAndLossStoryHandlers,
      ],
    },
    chromatic: { viewports: [1280] },
  },
  decorators: [withProfitAndLossStoryContext()],
  args: {
    scope: 'expenses',
  },
  render: ({ scope, chartColors }) => (
    <ProfitAndLossDetailedCharts
      scope={scope}
      hideClose
      chartColors={chartColors}
    />
  ),
}

export default meta

type Story = StoryObj<ScratchStoryArgs>

export const ExpensesDefaultColors: Story = {
  name: 'Expenses — default colors (baseline)',
}

export const ExpensesScopedColors: Story = {
  name: 'Expenses — scoped colors',
  args: { chartColors: CHART_COLORS },
}

export const RevenueScopedColors: Story = {
  name: 'Revenue — scoped colors',
  args: { scope: 'revenue', chartColors: CHART_COLORS },
}
