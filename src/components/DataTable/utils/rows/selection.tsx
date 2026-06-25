import {
  type ColumnDef,
  type OnChangeFn,
  type Row,
  type RowSelectionState,
} from '@tanstack/react-table'

import { Checkbox } from '@ui/Checkbox/Checkbox'
import { type ColumnConfig, getColumnDefs } from '@components/DataTable/utils/column'

export const DATA_TABLE_SELECTION_COLUMN_ID = 'Selection'

export type DataTableSelectionProps<TData> = {
  rowSelection: RowSelectionState
  onRowSelectionChange: OnChangeFn<RowSelectionState>
  selectAllAriaLabel: string
  getRowSelectionAriaLabel?: (row: Row<TData>) => string
  enableRowSelection?: boolean | ((row: Row<TData>) => boolean)
}

export const getColumnDefsWithSelection = <TData,>(
  columnConfig: ColumnConfig<TData>,
  selectionProps?: DataTableSelectionProps<TData>,
) => {
  const columnDefs = getColumnDefs(columnConfig)

  return selectionProps
    ? [getSelectionColumnDef(selectionProps), ...columnDefs]
    : columnDefs
}

export const getRowSelectionState = <TData,>(
  selectionProps?: DataTableSelectionProps<TData>,
) => selectionProps ? { rowSelection: selectionProps.rowSelection } : {}

export const getSelectionColumnDef = <TData,>(
  selectionProps: DataTableSelectionProps<TData>,
): ColumnDef<TData> => ({
  id: DATA_TABLE_SELECTION_COLUMN_ID,
  header: ({ table }) => {
    const isAllSelected = table.getIsAllPageRowsSelected()
    const isPartiallySelected = table.getIsSomePageRowsSelected() && !isAllSelected

    return (
      <Checkbox
        isSelected={isAllSelected}
        isIndeterminate={isPartiallySelected}
        onChange={selected => table.toggleAllPageRowsSelected(selected)}
        aria-label={selectionProps.selectAllAriaLabel}
      />
    )
  },
  cell: ({ row }) => (
    <Checkbox
      isSelected={row.getIsSelected()}
      isIndeterminate={row.getIsSomeSelected()}
      isDisabled={!row.getCanSelect()}
      onChange={selected => row.toggleSelected(selected)}
      aria-label={selectionProps.getRowSelectionAriaLabel?.(row)}
    />
  ),
  meta: { isRowHeader: false, preventRowClick: true },
})
