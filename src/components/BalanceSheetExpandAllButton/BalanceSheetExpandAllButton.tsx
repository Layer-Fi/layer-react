import React from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import { Button, ButtonVariant } from '../Button'

export const BalanceSheetExpandAllButton = () => {
  const { expandedAllRows, toggleAllRows } = useTableExpandRow()
  return (
    <Button onClick={() => toggleAllRows()} variant={ButtonVariant.secondary}>
      {!expandedAllRows ? 'Expand all rows' : 'Collapse all rows'}
    </Button>
  )
}
