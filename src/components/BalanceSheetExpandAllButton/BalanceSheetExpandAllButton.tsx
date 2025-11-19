import { type View } from '@internal-types/general'
import { useTableExpandRow } from '@hooks/useTableExpandRow/useTableExpandRow'
import { ExpandCollapseButton } from '@components/Button/ExpandCollapseButton'

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
