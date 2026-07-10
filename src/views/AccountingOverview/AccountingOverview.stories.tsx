import { type Meta, type StoryObj } from '@storybook/react-vite'

import { AccountingOverview } from '@views/AccountingOverview/AccountingOverview'

import { profitAndLossStoryHandlers, withOverviewStoryContext } from '@test-utils/withProfitAndLossStoryContext'

const meta: Meta<typeof AccountingOverview> = {
  title: 'Views/Overview/Accounting',
  component: AccountingOverview,
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

type Story = StoryObj<typeof AccountingOverview>

export const Default: Story = {}
