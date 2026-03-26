import classNames from 'classnames'

import { type TableCellProps } from '@internal-types/table'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import ChevronDownFill from '@icons/ChevronDownFill'

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
  nowrap,
}: TableCellProps) => {
  const { formatCurrencyFromCents } = useIntlFormatter()
  const amount = typeof children === 'number' ? children : 0
  const amountString = formatCurrencyFromCents(amount)

  const cellClassNames = classNames(
    'Layer__table-cell',
    (primary || isHeaderCell) && 'Layer__table-cell--primary',
    isHeaderCell && 'Layer__table-header',
    align && `Layer__table-cell--${align}`,
    nowrap && 'Layer__table-cell--nowrap',
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
