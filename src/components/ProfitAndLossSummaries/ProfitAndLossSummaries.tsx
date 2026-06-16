import { useTranslation } from 'react-i18next'

import type { Variants } from '@utils/styleUtils/sizeVariants'
import {
  SummariesContent,
  type SummariesTiles,
} from '@components/ProfitAndLossSummaries/internal/SummariesContent'
import { TransactionsToReview } from '@views/AccountingOverview/internal/TransactionsToReview'

export interface ProfitAndLossSummariesStringOverrides {
  revenueLabel?: string
  expensesLabel?: string
  netProfitLabel?: string
}

type ProfitAndLossSummariesProps = {
  actionable?: boolean
  stringOverrides?: ProfitAndLossSummariesStringOverrides
  chartColorsList?: string[]
  variants?: Variants
  onTransactionsToReviewClick?: () => void
  /**
   * @deprecated Use `stringOverrides.revenueLabel` instead
   */
  revenueLabel?: string
  /**
   * @deprecated Orientation is determined by the container size
   */
  vertical?: boolean
}

export function ProfitAndLossSummaries({
  actionable = false,
  revenueLabel,
  stringOverrides,
  chartColorsList,
  variants,
  onTransactionsToReviewClick,
}: ProfitAndLossSummariesProps) {
  const { t } = useTranslation()

  const tiles: SummariesTiles = {
    revenue: {
      label: stringOverrides?.revenueLabel || revenueLabel || t('common:label.revenue', 'Revenue'),
    },
    expenses: {
      label: stringOverrides?.expensesLabel || t('common:label.expenses', 'Expenses'),
    },
    net: {
      label: stringOverrides?.netProfitLabel || t('common:label.net_profit', 'Net Profit'),
    },
  }

  return (
    <SummariesContent
      mode='profitAndLoss'
      tiles={tiles}
      actionable={actionable}
      chartColorsList={chartColorsList}
      variants={variants}
      slots={{
        unstable_AdditionalListItems: onTransactionsToReviewClick
          ? [
            <TransactionsToReview
              key='transactions-to-review'
              variants={variants}
              onClick={onTransactionsToReviewClick}
            />,
          ]
          : undefined,
      }}
    />
  )
}
