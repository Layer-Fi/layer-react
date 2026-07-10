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
  /** The component's own prop, typed here only so its docgen entry can be hidden from the controls table. */
  onTransactionsToReviewClick?: () => void
}

const handleTransactionsToReviewClick = () => window.alert('onTransactionsToReviewClick')

const meta: Meta<ProfitAndLossSummariesStoryArgs> = {
  title: 'Components/ProfitAndLoss/Summaries',
  component: ProfitAndLossSummaries,
  parameters: {
    msw: { handlers: profitAndLossStoryHandlers },
    controls: { include: ['onTransactionsToReviewClick', 'withTransactionsToReviewCallback'] },
  },
  decorators: [withProfitAndLossStoryContext({ asContainer: false })],
  args: {
    actionable: false,
    reportingVariant: { type: 'profitAndLoss' },
    withTransactionsToReviewCallback: true,
  },
  argTypes: {
    actionable: { table: { disable: true } },
    reportingVariant: { table: { disable: true } },
    onTransactionsToReviewClick: { table: { disable: true } },
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
    <div className='ProfitAndLossStoryCard'>
      <ProfitAndLossSummaries
        actionable={actionable}
        reportingVariant={reportingVariant}
        onTransactionsToReviewClick={withTransactionsToReviewCallback ? handleTransactionsToReviewClick : undefined}
      />
    </div>
  ),
}

export default meta

type Story = StoryObj<ProfitAndLossSummariesStoryArgs>

export const ProfitAndLoss: Story = {}

export const CashFlow: Story = {
  args: {
    reportingVariant: { type: 'cashflow' },
  },
}
