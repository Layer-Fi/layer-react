import React from 'react'
import { TableProps } from '../../types/table'
import { TableRow } from './TableRow'
import classNames from 'classnames'

export const Table = ({
  componentName,
  columns,
  rows,
  maxDepth = 2,
  expandable = true,
  hoverEffect = true,
  withHeader = true,
}: TableProps) => {
  const tableClassNames = classNames(
    'Layer__table',
    hoverEffect && 'Layer__table--hover-effect',
    componentName && `Layer__${componentName}__table`,
  )
  return (
    <table className={tableClassNames}>
      {withHeader && (
        <thead>
          <tr>
            {columns.map((column, idx) => {
              const thClassNames = classNames(
                'Layer__table-header',
                idx === columns.length - 1 && 'Layer__table-cell--last',
                column.cellClassNames && column.cellClassNames,
              )
              return (
                <th key={`table-header-${idx}`} className={thClassNames}>
                  {column.data}
                </th>
              )
            })}
          </tr>
        </thead>
      )}

      <tbody>
        {rows.map((row, idx) => {
          return (
            <TableRow
              key={`table-row-${idx}`}
              row={row}
              maxDepth={maxDepth}
              expandable={expandable}
            />
          )
        })}
      </tbody>
    </table>
  )
}
