import React, { useState } from 'react'
import ChevronDownFill from '../../icons/ChevronDownFill'
import { centsToDollars } from '../../models/Money'
import { TableRowProps } from '../../types/table'
import classNames from 'classnames'
import { de } from 'date-fns/locale'

interface TableRowComponentProps {
  row: TableRowProps
  depth?: number
  maxDepth: number
  expandable?: boolean
}

export const TableRow = ({
  row,
  depth = 0,
  maxDepth,
  expandable,
}: TableRowComponentProps) => {
  const [expanded, setExpanded] = useState(false)
  const variant = row.summarize ? 'summation' : 'default'
  const canGoDeeper = depth < maxDepth
  const hasChildren = (row.line_items?.length ?? 0) > 0
  const displayChildren = hasChildren && canGoDeeper

  console.log(
    row.line_items,
    'hasChildren',
    hasChildren,
    'displayChildren',
    displayChildren,
  )

  const toggleExpanded = () => {
    if (expandable) setExpanded(!expanded)
  }

  const rowClassNames = classNames([
    'Layer__table-row',
    `Layer__table-row--depth-${depth}`,
    row.summarize && `Layer__table-row--variant-${variant}`,
    displayChildren &&
      `Layer__table-row--display-children-${
        !!row.line_items && depth < maxDepth
      }`,
    ,
    expanded && 'Layer__table-row--expanded',
    row.rowClassName && row.rowClassName,
  ])

  return (
    <>
      <tr className={rowClassNames} onClick={toggleExpanded}>
        {row.columns.map((column, idx) => {
          const amount = typeof column.data === 'number' ? column.data : 0
          const isPositive = amount >= 0
          const amountString = centsToDollars(Math.abs(amount))

          const tdClassNames = classNames(
            'Layer__table-cell',
            idx === 0 && 'Layer__table-cell--first',
            idx === row.columns.length - 1 && 'Layer__table-cell--last',
            column.cellClassNames && column.cellClassNames,
            !!column.data &&
              isPositive &&
              column.isCurrency &&
              'Layer__table-cell__value--positive',
            !!column.data &&
              !isPositive &&
              column.isCurrency &&
              'Layer__table-cell__value--negative',
          )
          return (
            <td key={`table-cell-${idx}`} className={tdClassNames}>
              {expandable && idx === 0 && hasChildren && (
                <ChevronDownFill
                  className='Layer__table__expand-icon'
                  size={16}
                />
              )}
              {column.isCurrency ? amountString : column.data}
            </td>
          )
        })}
      </tr>
      {canGoDeeper &&
        hasChildren &&
        (row.line_items || []).map((line_item, idx) => (
          <TableRow
            key={`table-row-child_${depth}_${idx}`}
            row={line_item}
            depth={depth + 1}
            maxDepth={maxDepth}
          />
        ))}
    </>
  )
}
