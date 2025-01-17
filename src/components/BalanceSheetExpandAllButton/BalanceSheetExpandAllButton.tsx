import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { View } from '../../types/general'
import { ExpandCollapseButton } from '../Button'

export interface BalanceSheetExpandAllButtonProps {
  view?: View
}

export const BalanceSheetExpandAllButton = ({
  view,
}: BalanceSheetExpandAllButtonProps) => {
  const { expandedAllRows, toggleAllRows } = useTableExpandRow()
  return (
    <ExpandCollapseButton
      onClick={toggleAllRows}
      expanded={expandedAllRows}
      iconOnly={view === 'mobile'}
    />
  )
}
