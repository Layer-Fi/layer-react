import classNames from 'classnames'

import { type TableRowProps } from '@internal-types/table'

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
  selected,
  onClick,
}) => {
  const toggleExpanded = (
    e: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  ) => {
    if (onClick) {
      onClick(e)
    }
    else {
      if (variant === 'summation' || !expandable) return
      if (handleExpand) handleExpand()
    }
  }

  const rowClassNames = classNames([
    'Layer__table-row',
    !isHeadRow && `Layer__table-row--depth-${depth}`,
    !isHeadRow && `Layer__table-row--variant-${variant}`,
    selected && 'Layer__table-row--selected',
    !isHeadRow
    && expandable
    && (isExpanded
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

      <tr
        data-key={rowKey}
        className={rowClassNames}
        onClick={e => toggleExpanded(e)}
      >
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
