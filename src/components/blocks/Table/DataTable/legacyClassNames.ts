import type { Row } from '@tanstack/react-table'
import classNames from 'classnames'

/** Per-column names, for tables whose hand-written cells carried their own. */
export type LegacyColumnClassNames = { cell?: string, column?: string }

export const LEGACY_TABLE_CLASS_NAMES = {
  TABLE: 'Layer__table',
  WRAPPER: 'Layer__table-wrapper Layer__table-wrapper--bottom-spacing',
  HEADER: 'Layer__table-header',
  CELL: 'Layer__table-cell Layer__table-cell-content',
}

const MAXIMUM_LEGACY_DEPTH = 10

export function getLegacyRowClassNames<TData>({
  row,
  isSelected,
}: {
  row: Row<TData>
  isSelected?: boolean
}) {
  return classNames(
    'Layer__table-row',
    `Layer__table-row--depth-${Math.min(row.depth, MAXIMUM_LEGACY_DEPTH)}`,
    isSelected && 'Layer__table-row--selected',
    row.getCanExpand() && (row.getIsExpanded() ? 'Layer__table-row--expanded' : 'Layer__table-row--collapsed'),
  )
}
