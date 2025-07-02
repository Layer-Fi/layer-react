import { forwardRef } from 'react'
import { withRenderProp } from '../../utility/withRenderProp'

import {
  Cell as ReactAriaCell,
  Column as ReactAriaColumn,
  ResizableTableContainer as ReactAriaResizableTableContainer,
  Row as ReactAriaTableRow,
  Table as ReactAriaTable,
  TableBody as ReactAriaTableBody,
  TableHeader as ReactAriaTableHeader,
  type CellProps,
  type ColumnProps,
  type ResizableTableContainerProps,
  type RowProps,
  type TableBodyProps,
  type TableHeaderProps,
  type TableProps,
} from 'react-aria-components'

// TABLE
const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, ...restProps }, ref) => {
    return (
      <ReactAriaTable {...restProps} ref={ref}>
        {children}
      </ReactAriaTable>
    )
  },
)

Table.displayName = 'Table'

// TABLE HEADER
const TableHeaderInner = <T extends object>(
  { children, ...restProps }: TableHeaderProps<T>,
  ref: React.Ref<HTMLTableSectionElement>,
) => {
  return (
    <ReactAriaTableHeader {...restProps} ref={ref}>
      {withRenderProp(children, node => node)}
    </ReactAriaTableHeader>
  )
}

const TableHeader = forwardRef(TableHeaderInner) as (<T>(
  props: TableHeaderProps<T> & { ref?: React.Ref<HTMLTableSectionElement> }
) => React.ReactElement) & { displayName?: string }

TableHeader.displayName = 'TableHeader'

// TABLE BODY
const TableBodyInner = <T extends object>(
  { children, ...restProps }: TableBodyProps<T>,
  ref: React.Ref<HTMLTableSectionElement>,
) => {
  return (
    <ReactAriaTableBody {...restProps} ref={ref}>
      {withRenderProp(children, node => node)}
    </ReactAriaTableBody>
  )
}

const TableBody = forwardRef(TableBodyInner) as (<T>(
  props: TableBodyProps<T> & { ref?: React.Ref<HTMLTableSectionElement> }
) => React.ReactElement) & { displayName?: string }

TableBody.displayName = 'TableBody'

// TABLE ROW
const RowInner = <T extends object>(
  { children, ...restProps }: RowProps<T>,
  ref: React.Ref<HTMLTableRowElement>,
) => {
  return (
    <ReactAriaTableRow {...restProps} ref={ref}>
      {withRenderProp(children, node => node)}
    </ReactAriaTableRow>
  )
}

const Row = forwardRef(RowInner) as (<T>(
  props: RowProps<T> & { ref?: React.Ref<HTMLTableRowElement> }
) => React.ReactElement) & { displayName?: string }

Row.displayName = 'Row'

// TABLE COLUMN
const Column = forwardRef<HTMLTableColElement, ColumnProps>(
  ({ children, ...restProps }, ref) => {
    return (
      <ReactAriaColumn {...restProps} ref={ref}>
        {withRenderProp(children, node => node)}
      </ReactAriaColumn>
    )
  },
)

Column.displayName = 'Column'

// TABLE CELL
const Cell = forwardRef<HTMLTableCellElement, CellProps>(
  ({ children, ...restProps }, ref) => {
    return (
      <ReactAriaCell {...restProps} ref={ref}>
        {withRenderProp(children, node => node)}
      </ReactAriaCell>
    )
  },
)

Cell.displayName = 'Cell'

// RESIZABLE TABLE CONTAINER
const ResizableTableContainer = forwardRef<HTMLDivElement, ResizableTableContainerProps>(
  ({ children, ...restProps }, ref) => {
    return (
      <ReactAriaResizableTableContainer {...restProps} ref={ref}>
        {children}
      </ReactAriaResizableTableContainer>
    )
  },
)

ResizableTableContainer.displayName = 'ResizableTableContainer'

export {
  Table,
  TableBody,
  TableHeader,
  Cell,
  Column,
  Row,
  ResizableTableContainer,
}
