import { UncategorizedTransactionsBadge } from '@components/CashflowSummaries/UncategorizedTransactionsBadge'
import { BaseSummariesBreakdownFooterContainer } from '@components/ProfitAndLossSummaries/internal/BaseSummariesBreakdownFooterContainer'
import { BaseSummariesBreakdownFooterRow, type BaseSummariesBreakdownRow } from '@components/ProfitAndLossSummaries/internal/BaseSummariesBreakdownFooterRow'

type CashflowSummariesNetCashflowFooterProps = {
  categorized: BaseSummariesBreakdownRow
  isLoading?: boolean
  onTransactionsToReviewClick?: () => void
}

export function CashflowSummariesNetCashflowFooter({
  categorized,
  isLoading = false,
  onTransactionsToReviewClick,
}: CashflowSummariesNetCashflowFooterProps) {
  return (
    <BaseSummariesBreakdownFooterContainer>
      <BaseSummariesBreakdownFooterRow row={categorized} isLoading={isLoading} />
      {onTransactionsToReviewClick && (
        <UncategorizedTransactionsBadge onTransactionsToReviewClick={onTransactionsToReviewClick} />
      )}
    </BaseSummariesBreakdownFooterContainer>
  )
}
