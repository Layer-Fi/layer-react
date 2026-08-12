import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type ProfitAndLossSummary } from '@schemas/features/profitAndLoss/profitAndLossSummaries'
import { ProfitAndLossChart } from '@features/profitAndLoss/ProfitAndLossChart/ProfitAndLossChart'

import { FIXTURE_YEAR } from '@fixtures/constants/fixtureYear'
import { get as getProfitAndLossSummaries } from '@msw/api/businesses/[business-id]/reports/profit-and-loss-summaries/get'
import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

const makeSummary = (year: number, month: number): ProfitAndLossSummary => ({
  year,
  month,
  income: 400000,
  costOfGoodsSold: 0,
  grossProfit: 400000,
  operatingExpenses: 250000,
  profitBeforeTaxes: 150000,
  taxes: 0,
  netProfit: 150000,
  fullyCategorized: false,
  totalExpenses: 250000,
  uncategorizedInflows: 200000,
  uncategorizedOutflows: 150000,
  uncategorizedTransactions: 4,
  categorizedTransactions: 12,
})

const UNCATEGORIZED_SUMMARIES: ProfitAndLossSummary[] = [
  ...Array.from({ length: 3 }, (_, index) => makeSummary(FIXTURE_YEAR - 1, 10 + index)),
  ...Array.from({ length: 9 }, (_, index) => makeSummary(FIXTURE_YEAR, 1 + index)),
]

const meta: Meta<typeof ProfitAndLossChart> = {
  title: 'Components/ProfitAndLoss/ChartStripePatterns',
  component: ProfitAndLossChart,
  parameters: {
    msw: {
      handlers: [
        getProfitAndLossSummaries.mock(UNCATEGORIZED_SUMMARIES),
        ...profitAndLossStoryHandlers,
      ],
    },
    chromatic: { viewports: [1280] },
  },
  decorators: [withProfitAndLossStoryContext()],
}

export default meta

type Story = StoryObj<typeof ProfitAndLossChart>

/** Baseline: one mount, default bar colors. The uncategorized stripes match the solid bars. */
export const SingleMount: Story = {
  render: () => <ProfitAndLossChart />,
}

/**
 * Two mounts under different `--bar-color-income` / `--bar-color-expenses` values. Each chart's
 * uncategorized stripes must follow its own overrides — before the pattern ids were made
 * instance-scoped, the second chart painted with the first chart's pattern element.
 */
export const TwoMountsWithDifferentBarColors: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: '2rem' }}>
      <div
        style={{
          display: 'grid',
          blockSize: '20rem',
          ['--bar-color-income' as string]: '#1B7F5E',
          ['--bar-color-expenses' as string]: '#0B3B2C',
        }}
      >
        <ProfitAndLossChart hideLegend />
      </div>
      <div
        style={{
          display: 'grid',
          blockSize: '20rem',
          ['--bar-color-income' as string]: '#C2410C',
          ['--bar-color-expenses' as string]: '#7C2D12',
        }}
      >
        <ProfitAndLossChart hideLegend />
      </div>
    </div>
  ),
}
