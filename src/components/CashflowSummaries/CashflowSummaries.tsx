import type { Variants } from '@utils/styleUtils/sizeVariants'
import {
  ProfitAndLossSummaries,
  type ProfitAndLossSummariesReportingVariant,
} from '@components/ProfitAndLossSummaries/ProfitAndLossSummaries'

export interface CashflowSummariesStringOverrides {
  moneyInLabel?: string
  moneyOutLabel?: string
  netCashFlowLabel?: string
}

type CashflowSummariesProps = {
  stringOverrides?: CashflowSummariesStringOverrides
  chartColorsList?: string[]
  reportingVariant?: ProfitAndLossSummariesReportingVariant
  variants?: Variants
  onTransactionsToReviewClick?: () => void
}

export function CashflowSummaries({
  stringOverrides,
  chartColorsList,
  reportingVariant = { type: 'cashflow' },
  variants,
  onTransactionsToReviewClick,
}: CashflowSummariesProps) {
  return (
    <ProfitAndLossSummaries
      stringOverrides={stringOverrides}
      chartColorsList={chartColorsList}
      reportingVariant={reportingVariant}
      variants={variants}
      onTransactionsToReviewClick={onTransactionsToReviewClick}
    />
  )
}
