import { ExpandCollapseButton } from '../Button/ExpandCollapseButton'
import { useTableExpandRow } from '../../hooks/useTableExpandRow/useTableExpandRow'
import { View } from '../../types/general'

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
