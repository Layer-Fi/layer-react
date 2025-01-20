import ChevronDownFill from '../../icons/ChevronDownFill'
import { centsToDollars } from '../../models/Money'
import { TableCellProps } from '../../types/table'
import classNames from 'classnames'

export const TableCell = ({
  children,
  className,
  isHeaderCell,
  isCurrency,
  align,
  primary,
  withExpandIcon = false,
  fullWidth,
  colSpan = 1,
  onClick,
  style,
  width,
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
    align && `Layer__table-cell--${align}`,
    className,
  )

  if (isHeaderCell) {
    return (
      <th className={cellClassNames} colSpan={colSpan} style={style}>
        <span className='Layer__table-cell-content'>{children}</span>
      </th>
    )
  }

  return (
    <td
      className={cellClassNames}
      style={{
        ...(fullWidth ? { width: '100%' } : width ? { width } : {}),
        ...(style ?? {}),
      }}
      colSpan={colSpan}
      onClick={e => onClick && onClick(e)}
    >
      <span className='Layer__table-cell-content'>
        {withExpandIcon && (
          <ChevronDownFill
            className='Layer__table-row--expand-icon'
            size={16}
          />
        )}
        {isCurrency ? amountString : children}
        {' '}
      </span>
    </td>
  )
}
