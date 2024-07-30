import React from 'react'
import { SkeletonLoader } from '../SkeletonLoader'

interface SkeletonTableLoaderProps {
  rows: number
  cols: Array<{ colSpan: number }>
  height?: number
  width?: number
}

export const SkeletonTableLoader = ({
  rows,
  cols,
  height = 20,
  width = 100,
}: SkeletonTableLoaderProps) => {
  return (
    <tbody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {cols.map((col, colIndex) => (
            <td
              key={colIndex}
              colSpan={col.colSpan}
              className='Layer__skeleton-loader__row'
            >
              <SkeletonLoader width={`${width}%`} height={`${height}px`} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  )
}
