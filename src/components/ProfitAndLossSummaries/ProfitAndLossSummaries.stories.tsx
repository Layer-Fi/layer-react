import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesReportingVariant,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@test-utils/withProfitAndLossStoryContext'

type ProfitAndLossSummariesStoryArgs = {
  actionable: boolean
  reportingVariant: ProfitAndLossSummariesReportingVariant
  withTransactionsToReviewCallback: boolean
}

const onTransactionsToReviewClick = () => window.alert('onTransactionsToReviewClick')

const meta: Meta<ProfitAndLossSummariesStoryArgs> = {
  title: 'Components/ProfitAndLoss/Summaries',
  component: ProfitAndLossSummaries,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['actionable', 'onTransactionsToReviewClick'] },
  },
  decorators: [withProfitAndLossStoryContext({ asContainer: false })],
  args: {
    actionable: false,
    reportingVariant: { type: 'profitAndLoss' },
    withTransactionsToReviewCallback: true,
  },
  argTypes: {
    actionable: {
      control: 'boolean',
      description: 'Make the revenue and expenses tiles clickable to set the sidebar scope',
    },
    reportingVariant: { table: { disable: true } },
    withTransactionsToReviewCallback: {
      name: 'onTransactionsToReviewClick',
      control: 'boolean',
      description:
        'The real prop is `onTransactionsToReviewClick?: () => void`. Toggle on to pass a callback, '
        + 'which shows the transactions-to-review tile (profit and loss) or badge (cash flow).',
      table: {
        category: 'Callbacks',
        type: { summary: '() => void' },
      },
    },
  },
  render: ({ actionable, reportingVariant, withTransactionsToReviewCallback }) => (
    <div style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid rgb(0 0 0 / 10%)' }}>
      <ProfitAndLossSummaries
        actionable={actionable}
        reportingVariant={reportingVariant}
        onTransactionsToReviewClick={withTransactionsToReviewCallback ? onTransactionsToReviewClick : undefined}
      />
    </div>
  ),
}

export default meta

type Story = StoryObj<ProfitAndLossSummariesStoryArgs>

export const ProfitAndLoss: Story = {
  args: {
    actionable: false,
  },
}

export const CashFlow: Story = {
  args: {
    reportingVariant: { type: 'cashflow' },
  },
}
