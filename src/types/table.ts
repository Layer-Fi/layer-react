export interface TableProps {
  componentName?: string
  columns: TableColumnProps[]
  rows: TableRowProps[]
  maxDepth?: number
  expandable?: boolean
  hoverEffect?: boolean
  withHeader?: boolean
}

export interface TableColumnProps {
  data: string | number
  cellClassNames?: string
  isCurrency?: boolean
}

export interface TableRowProps {
  columns: TableColumnProps[]
  line_items?: TableRowProps[]
  summarize?: boolean
  rowClassName?: string
}
