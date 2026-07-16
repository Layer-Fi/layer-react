import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingStatus } from '@schemas/bookkeepingStatus'
import { BookkeepingOverview } from '@views/BookkeepingOverview/BookkeepingOverview'

import { get as getBookkeepingStatus } from '@msw/api/businesses/[business-id]/bookkeeping/status/get'
import { makeBookkeepingStatus } from '@fixtures/bookkeeping/mocks'
import {
  buildSummariesSlotProps,
  buildSummariesStringOverrides,
  makeSummariesStoryControls,
  type SummariesStoryArgs,
  summariesStoryDefaultArgs,
} from '@test-utils/summariesStoryControls'
import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@test-utils/withProfitAndLossStoryContext'

type BookkeepingOverviewStoryArgs = SummariesStoryArgs & {
  showTitle: boolean
}

const summariesControls = makeSummariesStoryControls({
  stringOverridesPath: 'stringOverrides.profitAndLoss.summaries',
  slotPropsPath: 'slotProps.profitAndLoss.summaries',
  category: 'P&L summaries',
})

const meta: Meta<BookkeepingOverviewStoryArgs> = {
  title: 'Views/Overview/Bookkeeping',
  component: BookkeepingOverview,
  parameters: {
    msw: {
      handlers: [
        getBookkeepingStatus.mock(makeBookkeepingStatus({ status: BookkeepingStatus.ACTIVE })),
        ...profitAndLossStoryHandlers,
      ],
    },
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
    ...summariesControls.argTypes,
  },
  render: args => (
    <BookkeepingOverview
      showTitle={args.showTitle}
      stringOverrides={{ profitAndLoss: { summaries: buildSummariesStringOverrides(args) } }}
      slotProps={{ profitAndLoss: { summaries: buildSummariesSlotProps(args) } }}
    />
  ),
}

export default meta

type Story = StoryObj<BookkeepingOverviewStoryArgs>

export const Default: Story = {}
