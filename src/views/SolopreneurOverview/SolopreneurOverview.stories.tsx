import { type Meta, type StoryObj } from '@storybook/react-vite'

import { SolopreneurOverview, type SolopreneurOverviewProps } from '@views/SolopreneurOverview/SolopreneurOverview'

import { get as getAccountingConfiguration } from '@msw/api/businesses/[business-id]/accounting-config/get'
import { makeAccountingConfiguration } from '@fixtures/accountingConfiguration/mocks'
import {
  buildSummariesSlotProps,
  buildSummariesStringOverrides,
  makeSummariesStoryControls,
  type SummariesStoryArgs,
  summariesStoryDefaultArgs,
} from '@test-utils/summariesStoryControls'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@test-utils/withProfitAndLossStoryContext'

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

type SolopreneurOverviewStoryArgs = SummariesStoryArgs & Pick<SolopreneurOverviewProps, 'chartColorsList'>

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
    chartColorsList: { table: { disable: true } },
    ...summariesControls.argTypes,
  },
  render: args => (
    <SolopreneurOverview
      stringOverrides={{ profitAndLossSummaries: buildSummariesStringOverrides(args) }}
      slotProps={{ profitAndLoss: { summaries: buildSummariesSlotProps(args) } }}
    />
  ),
}

export default meta

type Story = StoryObj<SolopreneurOverviewStoryArgs>

export const Default: Story = {}
