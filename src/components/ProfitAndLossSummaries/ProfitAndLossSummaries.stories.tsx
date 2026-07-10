import { type Meta, type StoryObj } from '@storybook/react-vite'

import { ProfitAndLossSummaries } from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@test-utils/withProfitAndLossStoryContext'

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
  decorators: [withProfitAndLossStoryContext({ asContainer: false })],
  args: {
    actionable: false,
  },
  argTypes: {
    actionable: {
      control: 'boolean',
      description: 'Make the revenue and expenses tiles clickable to set the sidebar scope',
    },
  },
  render: ({ actionable }) => (
    <div style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid rgb(0 0 0 / 10%)' }}>
      <ProfitAndLossSummaries actionable={actionable} />
    </div>
  ),
}

export default meta

type Story = StoryObj<ProfitAndLossSummariesStoryArgs>

export const Default: Story = {}
