import { type Meta, type StoryObj } from '@storybook/react-vite'

import { AccountingOverview, type AccountingOverviewProps } from '@views/AccountingOverview/AccountingOverview'

import {
  buildSummariesSlotProps,
  buildSummariesStringOverrides,
  makeSummariesStoryControls,
  type SummariesStoryArgs,
  summariesStoryDefaultArgs,
} from '@testUtils/storybook/controls/summaries'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@testUtils/storybook/decorators/profitAndLoss'

type AccountingOverviewStoryArgs = SummariesStoryArgs
  & Pick<AccountingOverviewProps, 'chartConfig'>
  & { showTitle: boolean }

/**
 * One config reaches every P&L chart in the view: the summaries mini donuts and tile swatches,
 * the trend chart, and both scope donuts — each scope with its own palette.
 */
const CUSTOM_CHART_CONFIG: AccountingOverviewProps['chartConfig'] = {
  colors: {
    revenue: ['#0B7285', '#1098AD', '#22B8CF'],
    expenses: ['#A61E4D', '#C2255C', '#E64980'],
    uncategorized: '#FFD43B',
  },
  trendChart: { barSize: 36 },
  donutChart: { innerRadius: '70%' },
}

const summariesControls = makeSummariesStoryControls({
  stringOverridesPath: 'stringOverrides.profitAndLoss.summaries',
  slotPropsPath: 'slotProps.profitAndLoss.summaries',
  category: 'P&L summaries',
})

const meta: Meta<AccountingOverviewStoryArgs> = {
  title: 'Views/Overview/Accounting',
  tags: ['public-api'],
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
      chartConfig={args.chartConfig}
      stringOverrides={{ profitAndLoss: { summaries: buildSummariesStringOverrides(args) } }}
      slotProps={{ profitAndLoss: { summaries: buildSummariesSlotProps(args) } }}
    />
  ),
}

export default meta

type Story = StoryObj<AccountingOverviewStoryArgs>

export const Default: Story = {
  tags: ['docs-screenshot'],
}

export const CustomChartConfig: Story = {
  args: { chartConfig: CUSTOM_CHART_CONFIG },
}
