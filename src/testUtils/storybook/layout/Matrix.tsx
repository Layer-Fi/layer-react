import { Fragment, type ReactNode } from 'react'

import { Label } from './Label'

type MatrixProps<TRow, TColumn> = {
  rows: ReadonlyArray<TRow>
  columns: ReadonlyArray<TColumn>
  rowLabel: (row: TRow) => string
  columnLabel: (column: TColumn) => string
  renderCell: (row: TRow, column: TColumn) => ReactNode
  labelColumnSize?: number
  gap?: string
}

export const Matrix = <TRow, TColumn>({
  rows,
  columns,
  rowLabel,
  columnLabel,
  renderCell,
  labelColumnSize = 88,
  gap = '16px 24px',
}: MatrixProps<TRow, TColumn>) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: `${labelColumnSize}px repeat(${columns.length}, max-content)`,
      gap,
      alignItems: 'center',
      justifyItems: 'start',
    }}
  >
    <span />
    {columns.map(column => <Label key={columnLabel(column)}>{columnLabel(column)}</Label>)}
    {rows.map(row => (
      <Fragment key={rowLabel(row)}>
        <Label>{rowLabel(row)}</Label>
        {columns.map(column => (
          <Fragment key={columnLabel(column)}>{renderCell(row, column)}</Fragment>
        ))}
      </Fragment>
    ))}
  </div>
)
