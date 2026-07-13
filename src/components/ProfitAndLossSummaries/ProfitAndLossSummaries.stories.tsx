import { type Meta, type StoryObj } from '@storybook/react-vite'

import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesReportingVariant,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

import { profitAndLossStoryHandlers, withProfitAndLossStoryContext } from '@test-utils/withProfitAndLossStoryContext'

type ProfitAndLossSummariesStoryArgs = {
  actionable: boolean
  reportingVariant: ProfitAndLossSummariesReportingVariant
  showProfitAndLossBreakdown: boolean
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
    showProfitAndLossBreakdown: true,
    withTransactionsToReviewCallback: true,
  },
  argTypes: {
    actionable: { table: { disable: true } },
    reportingVariant: { table: { disable: true } },
    onTransactionsToReviewClick: { table: { disable: true } },
    showProfitAndLossBreakdown: {
      name: 'reportingVariant.showProfitAndLossBreakdown',
      control: 'boolean',
      description: 'Show the categorized/uncategorized breakdown footers',
      table: {
        category: 'Slot props',
        type: { summary: 'boolean' },
      },
    },
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
  render: ({ actionable, reportingVariant, showProfitAndLossBreakdown, withTransactionsToReviewCallback }) => (
    <div style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid rgb(0 0 0 / 10%)' }}>
      <ProfitAndLossSummaries
        actionable={actionable}
        reportingVariant={reportingVariant.type === 'cashflow'
          ? { type: 'cashflow', showProfitAndLossBreakdown }
          : reportingVariant}
        onTransactionsToReviewClick={withTransactionsToReviewCallback ? handleTransactionsToReviewClick : undefined}
      />
    </div>
  ),
}

export default meta

type Story = StoryObj<ProfitAndLossSummariesStoryArgs>

export const ProfitAndLoss: Story = {}

export const CashFlow: Story = {
  parameters: {
    controls: {
      include: [
        'onTransactionsToReviewClick',
        'withTransactionsToReviewCallback',
        'reportingVariant.showProfitAndLossBreakdown',
      ],
    },
  },
  args: {
    reportingVariant: { type: 'cashflow' },
  },
}
