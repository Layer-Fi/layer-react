import { type Meta, type StoryObj } from '@storybook/react-vite'

import { SolopreneurOverview, type SolopreneurOverviewProps } from '@views/SolopreneurOverview/SolopreneurOverview'

import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
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
import { UnifiedOverview } from './UnifiedOverview'
import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import { BookkeepingStatus } from '@schemas/bookkeepingConfiguration'
import { CardType } from '@schemas/overview/card'

const overviewStoryHandlers = [
  getAccountingConfiguration.mock(makeAccountingConfiguration({
    enableTaxEstimates: true,
    enableMileageTracking: true,
  })),
  getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
  ...profitAndLossStoryHandlers,
]

const summariesControls = makeSummariesStoryControls({
  stringOverridesPath: 'stringOverrides.profitAndLossSummaries',
  slotPropsPath: 'slotProps.profitAndLoss.summaries',
  category: 'P&L summaries',
})

type UnifiedOverviewStoryArgs = Pick<SolopreneurOverviewProps, 'chartColorsList'>

const defaultInteractionMap = {
    [CardType.ProfitAndLoss]: () => { console.log("Open profit and loss")}
}

const meta: Meta<UnifiedOverviewStoryArgs> = {
  title: 'Views/Overview/UnifiedOverview',
  component: UnifiedOverview,
  parameters: {
    msw: { handlers: overviewStoryHandlers },
    controls: { include: summariesControls.controlNames },
  },
  decorators: [withOverviewStoryContext],
//   args: {
//     ...summariesStoryDefaultArgs,
//     // The view defaults to the cashflow variant when no slot props are passed.
//     reportingVariant: 'cashflow',
//   },
//   argTypes: {
//     chartColorsList: { table: { disable: true } },
//     ...summariesControls.argTypes,
//   },
  render: args => (
    <UnifiedOverview interactionMap={defaultInteractionMap}/>
  ),
}

export default meta

type Story = StoryObj<UnifiedOverviewStoryArgs>

export const Default: Story = {}
