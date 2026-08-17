import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { SolopreneurOverview, type SolopreneurOverviewProps } from '@views/SolopreneurOverview/SolopreneurOverview'

import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { CUSTOM_CHART_CONFIG } from '@testUtils/storybook/controls/chartConfig'
import {
  buildSummariesSlotProps,
  buildSummariesStringOverrides,
  makeSummariesStoryControls,
  type SummariesStoryArgs,
  summariesStoryDefaultArgs,
} from '@testUtils/storybook/controls/summaries'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

const solopreneurStoryHandlers = [
  getAccountingConfiguration.mock(makeAccountingConfiguration({
    enableTaxEstimates: true,
    enableMileageTracking: true,
  })),
  ...profitAndLossStoryHandlers,
]

const summariesControls = makeSummariesStoryControls({
  stringOverridesPath: 'stringOverrides.profitAndLossSummaries',
  slotPropsPath: 'slotProps.profitAndLoss.summaries',
  category: 'P&L summaries',
})

type SolopreneurOverviewStoryArgs = SummariesStoryArgs
  & Pick<SolopreneurOverviewProps, 'chartColorsList'>
  & { chartConfig?: ProfitAndLossChartConfig }

const meta: Meta<SolopreneurOverviewStoryArgs> = {
  title: 'Views/Overview/Solopreneur',
  component: SolopreneurOverview,
  parameters: {
    msw: { handlers: solopreneurStoryHandlers },
    controls: { include: summariesControls.controlNames },
  },
  decorators: [withOverviewStoryContext],
  args: {
    ...summariesStoryDefaultArgs,
    // The view defaults to the cashflow variant when no slot props are passed.
    reportingVariant: 'cashflow',
  },
  argTypes: {
    chartConfig: { table: { disable: true } },
    chartColorsList: { table: { disable: true } },
    ...summariesControls.argTypes,
  },
  render: args => (
    <SolopreneurOverview
      stringOverrides={{ profitAndLossSummaries: buildSummariesStringOverrides(args) }}
      slotProps={{
        profitAndLoss: {
          summaries: { ...buildSummariesSlotProps(args), chartConfig: args.chartConfig },
        },
        summaryCards: {
          profitAndLoss: { chartConfig: args.chartConfig },
          expenses: { chartConfig: args.chartConfig },
        },
      }}
    />
  ),
}

export default meta

type Story = StoryObj<SolopreneurOverviewStoryArgs>

export const Default: Story = {
  tags: ['public-api', 'docs-screenshot', 'real-backend'],
}

export const CustomChartConfig: Story = {
  args: { chartConfig: CUSTOM_CHART_CONFIG },
}
