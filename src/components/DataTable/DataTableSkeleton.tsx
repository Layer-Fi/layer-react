import { useMemo } from 'react'

import {
  Cell,
  Column,
  Row,
} from '@ui/Table/Table'
import { SkeletonLoader } from '@components/SkeletonLoader/SkeletonLoader'

type DataTableSkeletonProps = {
  nonAria: boolean
  numColumns: number
}

type DataTableHeaderSkeletonProps = {
  nonAria: boolean
  numColumns?: number
}

export const DEFAULT_SKELETON_COLUMNS = 3

export const DataTableHeaderSkeleton = ({ nonAria, numColumns = DEFAULT_SKELETON_COLUMNS }: DataTableHeaderSkeletonProps) => {
  const resolvedNumColumns = numColumns > 0 ? numColumns : DEFAULT_SKELETON_COLUMNS

  return (
    <Row nonAria={nonAria}>
      {Array.from({ length: resolvedNumColumns }).map((_, index) => (
        <Column key={`loading-header-${index}`} nonAria={nonAria}>
          <SkeletonLoader width={index === 0 ? '60%' : '40%'} height='12px' />
        </Column>
      ))}
    </Row>
  )
}

export const DataTableSkeleton = ({ numColumns, nonAria }: DataTableSkeletonProps) => {
  const resolvedNumColumns = numColumns > 0 ? numColumns : DEFAULT_SKELETON_COLUMNS

  const loadingColumns = useMemo(
    () => Array.from({ length: resolvedNumColumns }, (_, index) => ({ index })),
    [resolvedNumColumns],
  )

  return (
    <>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <Row key={`loading-${rowIndex}`} nonAria={nonAria}>
          {loadingColumns.map((column) => {
            const trim = column.index === 0 && rowIndex >= 3
              ? (rowIndex - 2) * 10
              : 0
            return (
              <Cell key={`loading-${rowIndex}-${column.index}`} className='Layer__skeleton-loader__row' nonAria={nonAria}>
                <SkeletonLoader width={`${100 - trim}%`} height='20px' />
              </Cell>
            )
          })}
        </Row>
      ))}
    </>
  )
}
