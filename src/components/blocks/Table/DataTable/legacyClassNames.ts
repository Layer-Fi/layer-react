import type { Row } from '@tanstack/react-table'

export const LEGACY_TABLE_CLASS_NAME = 'Layer__table'
export const LEGACY_TABLE_WRAPPER_CLASS_NAME = 'Layer__table-wrapper Layer__table-wrapper--bottom-spacing'
export const LEGACY_TABLE_CELL_CLASS_NAME = 'Layer__table-cell'
export const LEGACY_TABLE_CELL_CONTENT_CLASS_NAME = 'Layer__table-cell-content'
export const LEGACY_TABLE_HEADER_CLASS_NAME = 'Layer__table-header'

const MAXIMUM_LEGACY_DEPTH = 10

export function getLegacyRowClassNames<TData>({
  row,
  isSelected,
}: {
  row: Row<TData>
  isSelected?: boolean
}) {
  const depth = Math.min(row.depth, MAXIMUM_LEGACY_DEPTH)

  return [
    'Layer__table-row',
    `Layer__table-row--depth-${depth}`,
    isSelected ? 'Layer__table-row--selected' : undefined,
    row.getCanExpand()
      ? (row.getIsExpanded() ? 'Layer__table-row--expanded' : 'Layer__table-row--collapsed')
      : undefined,
  ]
    .filter(Boolean)
    .join(' ')
}
