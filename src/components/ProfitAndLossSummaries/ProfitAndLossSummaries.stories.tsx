import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesReportingVariant,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@test-utils/withProfitAndLossStoryContext'

type ProfitAndLossSummariesStoryArgs = {
  actionable: boolean
  reportingVariant: ProfitAndLossSummariesReportingVariant
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
    reportingVariant: { type: 'profitAndLoss' },
  },
  argTypes: {
    actionable: {
      control: 'boolean',
      description: 'Make the revenue and expenses tiles clickable to set the sidebar scope',
    },
    reportingVariant: { table: { disable: true } },
  },
  render: ({ actionable, reportingVariant }) => (
    <div style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid rgb(0 0 0 / 10%)' }}>
      <ProfitAndLossSummaries actionable={actionable} reportingVariant={reportingVariant} />
    </div>
  ),
}

export default meta

type Story = StoryObj<ProfitAndLossSummariesStoryArgs>

export const ProfitAndLoss: Story = {}

export const Cashflow: Story = {
  args: {
    reportingVariant: { type: 'cashflow' },
  },
}
