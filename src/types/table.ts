export interface TableContextProps {
  tableState: boolean
  toggleTableState: () => void
}
export interface TableProps {
  children: React.ReactNode | React.ReactNode[]
  componentName?: string
  hoverEffect?: boolean
  borderCollapse?: 'collapse' | 'separate'
}

export interface TableHeadProps {
  children: React.ReactNode
}

export interface TableBodyProps {
  children: React.ReactNode | React.ReactNode[]
}
export interface TableRowProps {
  children: React.ReactNode | React.ReactNode[]
  depth?: number
  expandable?: boolean
  variant?: 'default' | 'summation' | 'expandable'
  withDivider?: boolean
  withDividerPosition?: 'top' | 'bottom'
}

export interface TableCellProps {
  children?: number | string | React.ReactNode
  isCurrency?: boolean
  isHeaderCell?: boolean
  primary?: boolean
}

export interface TableActionsProps {}
