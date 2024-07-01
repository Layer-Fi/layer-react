import React from 'react'
import { centsToDollars } from '../../models/Money'
import { TableCellProps } from '../../types/table'
import classNames from 'classnames'

export const TableCell = ({
  children,
  isHeaderCell,
  isCurrency,
  primary,
}: TableCellProps) => {
  const amount = typeof children === 'number' ? children : 0
  const isPositive = amount >= 0
  const amountString = centsToDollars(Math.abs(amount))

  const cellClassNames = classNames(
    'Layer__table-cell',
    (primary || isHeaderCell) && 'Layer__table-cell--primary',
    isCurrency && 'Layer__table-cell-amount',
    isCurrency && isPositive && 'Layer__table-cell-amount--positive',
    isCurrency && !isPositive && 'Layer__table-cell-amount--negative',
  )

  if (isHeaderCell) {
    return (
      <th className={cellClassNames}>
        <span className='Layer__table-cell-content'>{children}</span>
      </th>
    )
  }

  return (
    <td className={cellClassNames}>
      <span className='Layer__table-cell-content'>
        {isCurrency ? amountString : children}{' '}
      </span>
    </td>
  )
}
