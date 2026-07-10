import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingOverview } from '@views/BookkeepingOverview/BookkeepingOverview'

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
