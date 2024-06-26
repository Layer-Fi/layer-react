import React from 'react'
import { useTableExpandRow } from '../../hooks/useTableExpandRow'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { TableRowProps } from '../../types/table'
import classNames from 'classnames'

export const TableRow = ({
  children,
  depth = 0,
  expandable,
  variant = expandable ? 'expandable' : 'default',
  withDivider,
  withDividerPosition = 'top',
}: TableRowProps) => {
  const { isOpen, setIsOpen } = useTableExpandRow(0, false)

  const toggleExpanded = () => {
    if (variant === 'summation' || !expandable) return
    setIsOpen(!isOpen)
  }

  const rowClassNames = classNames([
    'Layer__table-row',
    `Layer__table-row--depth-${depth}`,
    `Layer__table-row--variant-${variant}`,
    isOpen && expandable && 'Layer__table-row--expanded',
  ])

  return (
    <>
      {withDivider && withDividerPosition === 'top' && (
        <tr className='Layer__table-empty-row'>
          <td />
        </tr>
      )}
      <tr className={rowClassNames} onClick={toggleExpanded}>
        <td
          className='Layer__table-row--expand-cell'
          style={{
            left: `${depth * 14 + 20}px`,
          }}
        >
          {expandable && (
            <ChevronDownFill
              className='Layer__table-row--expand-icon'
              size={16}
              style={{
                transform: isOpen ? 'rotate(-90deg)' : 'rotate(0deg)',
              }}
            />
          )}
        </td>
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
