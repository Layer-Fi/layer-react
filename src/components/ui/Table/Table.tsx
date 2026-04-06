import { forwardRef } from 'react'
import classNames, { type Argument } from 'classnames'
import {
  Cell as ReactAriaCell,
  type CellProps,
  Column as ReactAriaColumn,
  type ColumnProps,
  Row as ReactAriaRow,
  type RowProps,
  Table as ReactAriaTable,
  TableBody as ReactAriaTableBody,
  type TableBodyProps,
  TableHeader as ReactAriaTableHeader,
  type TableHeaderProps,
  type TableProps,
} from 'react-aria-components'

import { toDataProperties } from '@utils/styleUtils/toDataProperties'
import { withRenderProp } from '@components/utility/withRenderProp'

import './table.scss'

enum TableSubComponent {
  Table = 'Table',
  TableHeader = 'TableHeader',
  TableBody = 'TableBody',
  Row = 'Row',
  Column = 'Column',
  Cell = 'Cell',
}
const CSS_PREFIX = 'Layer__UI__Table'

const getClassName = (component: TableSubComponent, additionalClassNames?: Argument, withHidden?: boolean) =>
  classNames(`${CSS_PREFIX}-${component}`, withHidden && `${CSS_PREFIX}-${component}--hidden`, additionalClassNames)

type TableRenderingProps = {
  nonAria?: boolean
}

// TABLE
const Table = forwardRef<HTMLTableElement, TableProps & TableRenderingProps>(
  ({ children, className, nonAria, slot, ...restProps }, ref) => {
    const TableComponent = nonAria
      ? 'table'
      : ReactAriaTable

    return (
      <TableComponent
        className={getClassName(TableSubComponent.Table, className)}
        slot={slot ?? undefined}
        {...restProps}
        ref={ref}
      >
        {children}
      </TableComponent>
    )
  },
)

Table.displayName = TableSubComponent.Table

// TABLE HEADER
type TableHeaderStyleProps = {
  hideHeader?: boolean
}

const TableHeaderInner = <T extends object>(
  { children, className, hideHeader, nonAria, ...restProps }: TableHeaderProps<T> & TableHeaderStyleProps & TableRenderingProps,
  ref: React.Ref<HTMLTableSectionElement>,
) => {
  const TableHeaderComponent = nonAria
    ? 'thead'
    : ReactAriaTableHeader

  return (
    <TableHeaderComponent
      className={getClassName(TableSubComponent.TableHeader, className, hideHeader)}
      {...restProps}
      ref={ref}
    >
      {withRenderProp(children, node => node) as React.ReactNode}
    </TableHeaderComponent>
  )
}

const TableHeader = forwardRef(TableHeaderInner) as (<T>(
  props: TableHeaderProps<T> & TableHeaderStyleProps & TableRenderingProps & { ref?: React.Ref<HTMLTableSectionElement> }
) => React.ReactElement) & { displayName?: string }

TableHeader.displayName = TableSubComponent.TableHeader

// TABLE BODY

const TableBodyInner = <T extends object>(
  { children, className, nonAria, ...restProps }: TableBodyProps<T> & TableRenderingProps,
  ref: React.Ref<HTMLTableSectionElement>,
) => {
  const TableBodyComponent = nonAria
    ? 'tbody'
    : ReactAriaTableBody

  return (
    <TableBodyComponent
      className={getClassName(TableSubComponent.TableBody, className)}
      {...restProps}
      ref={ref}
    >
      {withRenderProp(children, node => node) as React.ReactNode}
    </TableBodyComponent>
  )
}

const TableBody = forwardRef(TableBodyInner) as (<T>(
  props: TableBodyProps<T> & TableRenderingProps & { ref?: React.Ref<HTMLTableSectionElement> }
) => React.ReactElement) & { displayName?: string }

TableBody.displayName = TableSubComponent.TableBody

// TABLE ROW
type RowStyleProps = {
  depth?: number
}

const RowInner = <T extends object>(
  { children, className, depth = 0, nonAria, id, ...restProps }: RowProps<T> & RowStyleProps & TableRenderingProps,
  ref: React.Ref<HTMLTableRowElement>,
) => {
  const dataProperties = toDataProperties({ depth })

  const RowComponent = nonAria
    ? 'tr'
    : ReactAriaRow

  return (
    <RowComponent
      className={getClassName(TableSubComponent.Row, className)}
      {...restProps}
      {...dataProperties}
      ref={ref}
      id={id?.toString()}
    >
      {withRenderProp(children, node => node) as React.ReactNode}
    </RowComponent>
  )
}

const Row = forwardRef(RowInner) as (<T>(
  props: RowProps<T> & RowStyleProps & TableRenderingProps & { ref?: React.Ref<HTMLTableRowElement> }
) => React.ReactElement) & { displayName?: string }

Row.displayName = TableSubComponent.Row

// TABLE COLUMN
type ColumnStyleProps = {
  textAlign?: 'left' | 'center' | 'right'
  colSpan?: number
}

const Column = forwardRef<HTMLTableCellElement, ColumnProps & ColumnStyleProps & TableRenderingProps>(
  ({ children, className, nonAria, id, textAlign = 'left', colSpan = 1, ...restProps }, ref) => {
    const dataProperties = toDataProperties({ 'text-align': textAlign })
    const columnClassName = getClassName(TableSubComponent.Column, className)

    const ColumnComponent = nonAria
      ? 'th'
      : ReactAriaColumn

    return (
      <ColumnComponent
        className={columnClassName}
        {...restProps}
        {...dataProperties}
        ref={ref}
        id={id?.toString()}
        colSpan={colSpan}
      >
        {withRenderProp(children, node => node) as React.ReactNode}
      </ColumnComponent>
    )
  },
)

Column.displayName = TableSubComponent.Column

// TABLE CELL

const Cell = forwardRef<HTMLTableCellElement, CellProps & TableRenderingProps>(
  ({ children, className, nonAria, id, ...restProps }, ref) => {
    const CellComponent = nonAria
      ? 'td'
      : ReactAriaCell

    return (
      <CellComponent
        className={getClassName(TableSubComponent.Cell, className)}
        {...restProps}
        ref={ref}
        id={id?.toString()}
      >
        {withRenderProp(children, node => node) as React.ReactNode}
      </CellComponent>
    )
  },
)

Cell.displayName = TableSubComponent.Cell

export {
  Cell,
  Column,
  Row,
  Table,
  TableBody,
  TableHeader,
}
