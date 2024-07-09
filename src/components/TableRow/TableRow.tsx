import React from 'react'
import { TableRowProps } from '../../types/table'
import classNames from 'classnames'

export const TableRow: React.FC<TableRowProps> = ({
  rowKey,
  children,
  depth = 0,
  expandable = false,
  isExpanded = false,
  handleExpand,
  variant = expandable ? 'expandable' : 'default',
  withDivider,
  withDividerPosition = 'top',
  isHeadRow = false,
}) => {
  const toggleExpanded = () => {
    if (variant === 'summation' || !expandable) return
    handleExpand && handleExpand()
  }

  const rowClassNames = classNames([
    'Layer__table-row',
    !isHeadRow && `Layer__table-row--depth-${depth}`,
    !isHeadRow && `Layer__table-row--variant-${variant}`,
    !isHeadRow &&
      expandable &&
      (isExpanded
        ? 'Layer__table-row--expanded'
        : 'Layer__table-row--collapsed'),
  ])

  return (
    <>
      {withDivider && withDividerPosition === 'top' && (
        <tr className='Layer__table-empty-row'>
          <td colSpan={Array.isArray(children) ? children.length : 1} />
        </tr>
      )}

      <tr data-key={rowKey} className={rowClassNames} onClick={toggleExpanded}>
        {children}
      </tr>

      {withDivider && withDividerPosition === 'bottom' && (
        <tr className='Layer__table-empty-row'>
          <td colSpan={Array.isArray(children) ? children.length : 1} />
        </tr>
      )}
    </>
  )
}
