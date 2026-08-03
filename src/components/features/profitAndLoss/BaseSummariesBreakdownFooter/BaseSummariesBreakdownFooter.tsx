import { BaseSummariesBreakdownFooterContainer } from '@features/profitAndLoss/BaseSummariesBreakdownFooter/BaseSummariesBreakdownFooterContainer'
import {
  BaseSummariesBreakdownFooterRow,
  type BaseSummariesBreakdownRow,
} from '@features/profitAndLoss/BaseSummariesBreakdownFooter/BaseSummariesBreakdownFooterRow'

type BaseSummariesBreakdownFooterProps = {
  categorized: BaseSummariesBreakdownRow
  uncategorized: BaseSummariesBreakdownRow
  isLoading?: boolean
}

export function BaseSummariesBreakdownFooter({
  categorized,
  uncategorized,
  isLoading = false,
}: BaseSummariesBreakdownFooterProps) {
  return (
    <BaseSummariesBreakdownFooterContainer>
      <BaseSummariesBreakdownFooterRow row={categorized} isLoading={isLoading} />
      <BaseSummariesBreakdownFooterRow row={uncategorized} isLoading={isLoading} />
    </BaseSummariesBreakdownFooterContainer>
  )
}
