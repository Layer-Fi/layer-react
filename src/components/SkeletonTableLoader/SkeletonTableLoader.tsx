import { SkeletonLoader } from '../SkeletonLoader/SkeletonLoader'

interface SkeletonTableLoaderProps {
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

export const SkeletonTableLoader = ({
  rows,
  cols,
  height = 20,
  width = 100,
}: SkeletonTableLoaderProps) => {
  return (
    <tbody className='Layer__skeleton-table-body__loader'>
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
                className='Layer__skeleton-loader__row'
              >
                {col.colComponent
                  ? (
                    col.colComponent
                  )
                  : col.parts && col.parts > 1
                    ? (
                      <span className='Layer__skeleton-loader__row__group'>
                        {Array(col.parts).map((_part, partIndex) => (
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
