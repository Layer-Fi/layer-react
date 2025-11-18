import { type TableHeadProps } from '@internal-types/table'

export const TableHead = ({ children }: TableHeadProps) => {
  return <thead className='Layer__table-header'>{children}</thead>
}
