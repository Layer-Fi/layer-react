import { type Meta, type StoryObj } from '@storybook/react-vite'

import { SolopreneurOverview, type SolopreneurOverviewProps } from '@views/SolopreneurOverview/SolopreneurOverview'

import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
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
  & Pick<SolopreneurOverviewProps, 'chartConfig' | 'chartColorsList'>

/**
 * One config reaches every P&L chart in the view: the summaries mini donuts and tile swatches,
 * the expenses summary card donut, and the P&L summary card trend chart.
 */
const CUSTOM_CHART_CONFIG: SolopreneurOverviewProps['chartConfig'] = {
  colors: {
    revenue: ['#0B7285', '#1098AD', '#22B8CF'],
    expenses: ['#A61E4D', '#C2255C', '#E64980'],
    uncategorized: '#FFD43B',
  },
  trendChart: { barSize: 28 },
  donutChart: { innerRadius: '70%' },
}

const meta: Meta<SolopreneurOverviewStoryArgs> = {
  title: 'Views/Overview/Solopreneur',
  tags: ['public-api'],
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
      chartConfig={args.chartConfig}
      stringOverrides={{ profitAndLossSummaries: buildSummariesStringOverrides(args) }}
      slotProps={{ profitAndLoss: { summaries: buildSummariesSlotProps(args) } }}
    />
  ),
}

export default meta

type Story = StoryObj<SolopreneurOverviewStoryArgs>

export const Default: Story = {
  tags: ['docs-screenshot'],
}

export const CustomChartConfig: Story = {
  args: { chartConfig: CUSTOM_CHART_CONFIG },
}
