import { type Row } from '@tanstack/react-table'

export type DataTableExpandedRowProps<TData> = {
  render: (row: Row<TData>) => React.ReactNode
  getRowCanExpand?: (row: Row<TData>) => boolean
}
