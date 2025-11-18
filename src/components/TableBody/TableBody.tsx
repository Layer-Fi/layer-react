import { TableBodyProps } from '@internal-types/table'

export const TableBody = ({ children }: TableBodyProps) => {
  return <tbody className='Layer__table-body'>{children}</tbody>
}
