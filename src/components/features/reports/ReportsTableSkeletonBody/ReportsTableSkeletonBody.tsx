import { SkeletonLoader } from '@ui/SkeletonLoader/SkeletonLoader'

import './reportsTableSkeletonBody.scss'

interface ReportsTableSkeletonBodyProps {
  rows: number
  cols: Array<{
    colSpan: number
    colComponent?: React.ReactNode
    trimLastXRows?: number
    parts?: number
  }>
  height?: number
  width?: number
}

export const ReportsTableSkeletonBody = ({
  rows,
  cols,
  height = 20,
  width = 100,
}: ReportsTableSkeletonBodyProps) => {
  return (
    <tbody className='Layer__ReportsTableSkeletonBody'>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {cols.map((col, colIndex) => {
            const trim: number =
              col.trimLastXRows && rowIndex >= col.trimLastXRows - 1
                ? (rowIndex - col.trimLastXRows + 1) * 10
                : 0
            return (
              <td
                key={colIndex}
                colSpan={col.colSpan}
                className='Layer__ReportsTableSkeletonBody__Row'
              >
                {col.colComponent
                  ? (
                    col.colComponent
                  )
                  : col.parts && col.parts > 1
                    ? (
                      <span className='Layer__ReportsTableSkeletonBody__RowGroup'>
                        {Array.from({ length: col.parts }).map((_, partIndex) => (
                          <SkeletonLoader
                            key={`part-${partIndex}`}
                            width='100%'
                            height={`${height}px`}
                          />
                        ))}
                      </span>
                    )
                    : (
                      <SkeletonLoader
                        width={`${width - trim}%`}
                        height={`${height}px`}
                      />
                    )}
              </td>
            )
          })}
        </tr>
      ))}
    </tbody>
  )
}
