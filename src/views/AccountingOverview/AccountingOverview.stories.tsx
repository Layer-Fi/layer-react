import { type Meta, type StoryObj } from '@storybook/react-vite'

import { type ProfitAndLossChartConfig } from '@internal-types/features/profitAndLoss/profitAndLossChartConfig'
import { AccountingOverview, type AccountingOverviewProps } from '@views/AccountingOverview/AccountingOverview'

import { CUSTOM_CHART_CONFIG } from '@testUtils/storybook/controls/chartConfig'
import {
  buildSummariesSlotProps,
  buildSummariesStringOverrides,
  makeSummariesStoryControls,
  type SummariesStoryArgs,
  summariesStoryDefaultArgs,
} from '@testUtils/storybook/controls/summaries'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

type AccountingOverviewStoryArgs = SummariesStoryArgs
  & Pick<AccountingOverviewProps, 'showTitle'>
  & { chartConfig?: ProfitAndLossChartConfig }

const summariesControls = makeSummariesStoryControls({
  stringOverridesPath: 'stringOverrides.profitAndLoss.summaries',
  slotPropsPath: 'slotProps.profitAndLoss.summaries',
  category: 'P&L summaries',
})

const meta: Meta<AccountingOverviewStoryArgs> = {
  title: 'Views/Overview/Accounting',
  component: AccountingOverview,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['showTitle', ...summariesControls.controlNames] },
  },
  decorators: [withOverviewStoryContext],
  args: {
    showTitle: true,
    ...summariesStoryDefaultArgs,
  },
  argTypes: {
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and month picker header',
    },
    chartConfig: { table: { disable: true } },
    ...summariesControls.argTypes,
  },
  render: args => (
    <AccountingOverview
      showTitle={args.showTitle}
      stringOverrides={{ profitAndLoss: { summaries: buildSummariesStringOverrides(args) } }}
      slotProps={{
        profitAndLoss: {
          summaries: { ...buildSummariesSlotProps(args), chartConfig: args.chartConfig },
          chart: { chartConfig: args.chartConfig },
          detailedCharts: {
            revenue: { chartConfig: args.chartConfig },
            expenses: { chartConfig: args.chartConfig },
          },
        },
      }}
    />
  ),
}

export default meta

type Story = StoryObj<AccountingOverviewStoryArgs>

export const Default: Story = {
  tags: ['public-api', 'docs-screenshot', 'real-backend'],
}

export const CustomChartConfig: Story = {
  args: { chartConfig: CUSTOM_CHART_CONFIG },
}
