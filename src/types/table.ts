import { ReactNode } from 'react'

export interface TableContextProps {
  expandedRows: string[]
  setExpandedRows: (rowKey: string) => void
  expandAllRows: (rowKeys: string[]) => void
  expandedAllRows: boolean
  setExpandedAllRows: (expanded: boolean) => void
}

export enum TableCellAlign {
  RIGHT = 'right',
  LEFT = 'left',
}

export interface TableProps {
  children: ReactNode | ReactNode[]
  componentName?: string
  borderCollapse?: 'collapse' | 'separate'
  bottomSpacing?: boolean
}

export interface TableHeadProps {
  children: React.ReactNode
}

export interface TableBodyProps {
  children: ReactNode | ReactNode[]
}

export interface TableRowProps {
  rowKey: string
  children: ReactNode
  depth?: number
  expandable?: boolean
  variant?: 'expandable' | 'default' | 'summation'
  withDivider?: boolean
  withDividerPosition?: 'top' | 'bottom'
  isExpanded?: boolean
  handleExpand?: () => void
  onClick?: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => void
  isHeadRow?: boolean
  selected?: boolean
}

export interface TableCellProps {
  children?: number | string | ReactNode
  isCurrency?: boolean
  isHeaderCell?: boolean
  align?: TableCellAlign
  primary?: boolean
  withExpandIcon?: boolean
  fullWidth?: boolean
  colSpan?: number
  onClick?: (e: React.MouseEvent<HTMLTableCellElement, MouseEvent>) => void
}
