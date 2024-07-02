export interface TableContextProps {
  expandedRows: string[]
  setExpandedRows: (rowKey: string) => void
  collapseRows: () => void
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
  children: React.ReactNode
  depth?: number
  expandable?: boolean
  variant?: 'expandable' | 'default' | 'summation'
  withDivider?: boolean
  withDividerPosition?: 'top' | 'bottom'
  isExpanded?: boolean
  handleExpand?: () => void
  isHeadRow?: boolean
}

export interface TableCellProps {
  children?: number | string | React.ReactNode
  isCurrency?: boolean
  isHeaderCell?: boolean
  primary?: boolean
  withExpandIcon?: boolean
}
