import { type MutableRefObject } from 'react'

export enum PaginationChangeSource {
  Sync = 'sync',
  User = 'user',
}

export interface TablePaginationProps {
  pageIndex?: number
  onPageIndexChange?: (pageIndex: number, source: PaginationChangeSource) => void
  pageSize?: number
  hasMore?: boolean
  fetchMore?: () => void
  autoResetPageIndexRef?: MutableRefObject<boolean>
}
