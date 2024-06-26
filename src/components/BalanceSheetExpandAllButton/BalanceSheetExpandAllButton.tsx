import React, { useContext } from 'react'
import { TableContext } from '../../contexts/TableContext'
import { Button, ButtonVariant } from '../Button'

export const BalanceSheetExpandAllButton = () => {
  const { tableState, toggleTableState } = useContext(TableContext)
  return (
    <Button onClick={toggleTableState} variant={ButtonVariant.secondary}>
      {tableState ? 'Expand all rows' : 'Collapse all rows'}
    </Button>
  )
}
