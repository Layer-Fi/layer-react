import { forwardRef } from 'react'
import { withRenderProp } from '../../utility/withRenderProp'

import {
  Cell as ReactAriaCell,
  Column as ReactAriaColumn,
  Row as ReactAriaTableRow,
  Table as ReactAriaTable,
  TableBody as ReactAriaTableBody,
  TableHeader as ReactAriaTableHeader,
  type CellProps,
  type ColumnProps,
  type RowProps,
  type TableBodyProps,
  type TableHeaderProps,
  type TableProps,
} from 'react-aria-components'
import classNames, { type Argument } from 'classnames'
import { toDataProperties } from '../../../utils/styleUtils/toDataProperties'

enum TableComponent {
  Table = 'Table',
  TableHeader = 'TableHeader',
  TableBody = 'TableBody',
  Row = 'Row',
  Column = 'Column',
  Cell = 'Cell',
}
const CSS_PREFIX = 'Layer__UI__Table'

const getClassName = (component: TableComponent, additionalClassNames?: Argument) =>
  classNames(`${CSS_PREFIX}-${component}`, additionalClassNames)

// TABLE
const Table = forwardRef<HTMLTableElement, TableProps>(
  ({ children, className, ...restProps }, ref) => {
    return (
      <ReactAriaTable
        className={getClassName(TableComponent.Table, className)}
        {...restProps}
        ref={ref}
      >
        {children}
      </ReactAriaTable>
    )
  },
)

Table.displayName = TableComponent.Table

// TABLE HEADER
const TableHeaderInner = <T extends object>(
  { children, className, ...restProps }: TableHeaderProps<T>,
  ref: React.Ref<HTMLTableSectionElement>,
) => {
  return (
    <ReactAriaTableHeader
      className={getClassName(TableComponent.TableHeader, className)}
      {...restProps}
      ref={ref}
    >
      {withRenderProp(children, node => node)}
    </ReactAriaTableHeader>
  )
}

const TableHeader = forwardRef(TableHeaderInner) as (<T>(
  props: TableHeaderProps<T> & { ref?: React.Ref<HTMLTableSectionElement> }
) => React.ReactElement) & { displayName?: string }

TableHeader.displayName = TableComponent.TableHeader

// TABLE BODY
const TableBodyInner = <T extends object>(
  { children, className, ...restProps }: TableBodyProps<T>,
  ref: React.Ref<HTMLTableSectionElement>,
) => {
  return (
    <ReactAriaTableBody
      className={getClassName(TableComponent.TableBody, className)}
      {...restProps}
      ref={ref}
    >
      {withRenderProp(children, node => node)}
    </ReactAriaTableBody>
  )
}

const TableBody = forwardRef(TableBodyInner) as (<T>(
  props: TableBodyProps<T> & { ref?: React.Ref<HTMLTableSectionElement> }
) => React.ReactElement) & { displayName?: string }

TableBody.displayName = TableComponent.TableBody

// TABLE ROW
const RowInner = <T extends object>(
  { children, className, ...restProps }: RowProps<T>,
  ref: React.Ref<HTMLTableRowElement>,
) => {
  return (
    <ReactAriaTableRow
      className={getClassName(TableComponent.Row, className)}
      {...restProps}
      ref={ref}
    >
      {withRenderProp(children, node => node)}
    </ReactAriaTableRow>
  )
}

const Row = forwardRef(RowInner) as (<T>(
  props: RowProps<T> & { ref?: React.Ref<HTMLTableRowElement> }
) => React.ReactElement) & { displayName?: string }

Row.displayName = TableComponent.Row

type ColumnStyleProps = {
  textAlign?: 'left' | 'center' | 'right'
}

// TABLE COLUMN
const Column = forwardRef<HTMLTableColElement, ColumnProps & ColumnStyleProps>(
  ({ children, className, textAlign = 'left', ...restProps }, ref) => {
    const dataProperties = toDataProperties({ 'text-align': textAlign })

    return (
      <ReactAriaColumn
        className={getClassName(TableComponent.Column, className)}
        {...restProps}
        {...dataProperties}
        ref={ref}
      >
        {withRenderProp(children, node => node)}
      </ReactAriaColumn>
    )
  },
)

Column.displayName = TableComponent.Column

// TABLE CELL
const Cell = forwardRef<HTMLTableCellElement, CellProps>(
  ({ children, className, ...restProps }, ref) => {
    return (
      <ReactAriaCell
        className={getClassName(TableComponent.Cell, className)}
        {...restProps}
        ref={ref}
      >
        {withRenderProp(children, node => node)}
      </ReactAriaCell>
    )
  },
)

Cell.displayName = TableComponent.Cell

export {
  Table,
  TableBody,
  TableHeader,
  Cell,
  Column,
  Row,
}
