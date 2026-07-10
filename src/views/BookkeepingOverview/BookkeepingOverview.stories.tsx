import { type Meta, type StoryObj } from '@storybook/react-vite'

import { BookkeepingOverview } from '@views/BookkeepingOverview/BookkeepingOverview'

import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@test-utils/withProfitAndLossStoryContext'

const meta: Meta<typeof BookkeepingOverview> = {
  title: 'Views/Overview/Bookkeeping',
  component: BookkeepingOverview,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['showTitle'] },
  },
  decorators: [withOverviewStoryContext],
  args: {
    showTitle: true,
  },
  argTypes: {
    showTitle: {
      control: 'boolean',
      description: 'Show the view title and month picker header',
    },
  },
}

export default meta

type Story = StoryObj<typeof BookkeepingOverview>

export const Default: Story = {}
