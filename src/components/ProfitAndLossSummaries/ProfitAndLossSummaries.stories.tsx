import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ProfitAndLossSummaries } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@test-utils/profitAndLossStorybook'

type ProfitAndLossSummariesStoryArgs = {
  actionable: boolean
}

const meta: Meta<ProfitAndLossSummariesStoryArgs> = {
  title: 'Components/ProfitAndLoss/Summaries',
  component: ProfitAndLossSummaries,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['actionable'] },
  },
  decorators: [withProfitAndLossStoryContext],
  args: {
    actionable: false,
  },
  argTypes: {
    actionable: {
      control: 'boolean',
      description: 'Make the revenue and expenses tiles clickable to set the sidebar scope',
    },
  },
  render: ({ actionable }) => <ProfitAndLossSummaries actionable={actionable} />,
}

export default meta

type Story = StoryObj<ProfitAndLossSummariesStoryArgs>

export const Default: Story = {}
