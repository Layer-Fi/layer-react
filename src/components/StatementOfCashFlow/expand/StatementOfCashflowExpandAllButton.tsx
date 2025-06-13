import { useTableExpandRow } from '../../../hooks/useTableExpandRow'
import { View } from '../../../types/general'
import { ExpandCollapseButton } from '../../Button'

export interface StatementOfCashflowExpandAllButtonProps {
  view?: View
}

export const StatementOfCashflowExpandAllButton = ({
  view,
}: StatementOfCashflowExpandAllButtonProps) => {
  const { expandedAllRows, toggleAllRows } = useTableExpandRow()
  return (
    <ExpandCollapseButton
      onClick={toggleAllRows}
      expanded={expandedAllRows}
      iconOnly={view === 'mobile'}
    />
  )
}
