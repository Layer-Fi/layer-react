import React, { useContext } from 'react'
import { TableExpandContext } from '../../contexts/TableExpandContext'
import { Button, ButtonVariant } from '../Button'

export const BalanceSheetExpandAllButton = () => {
  const { tableExpandState, toggleTableExpandState } =
    useContext(TableExpandContext)
  return (
    <Button onClick={toggleTableExpandState} variant={ButtonVariant.secondary}>
      {!tableExpandState ? 'Expand all rows' : 'Collapse all rows'}
    </Button>
  )
}
