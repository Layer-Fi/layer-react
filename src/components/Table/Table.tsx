import React, { useEffect, useRef } from 'react'
import { TableProps } from '../../types/table'
import classNames from 'classnames'

export const Table = ({
  componentName,
  children,
  borderCollapse = 'separate',
  bottomSpacing = true,
}: TableProps) => {
  const tableRef = useRef<HTMLTableElement>(null)
  const prevChildrenRef = useRef<string[]>([])

  useEffect(() => {
    if (tableRef.current) {
      const tbody = tableRef.current.querySelector('tbody')
      const rows = tbody ? Array.from(tbody.querySelectorAll('tr')) : []

      const prevChildrenArray = prevChildrenRef.current
      const currentChildren = rows.map(child => child.getAttribute('data-key'))

      const newChildrenArray = currentChildren.filter(el => {
        return el && !prevChildrenArray.includes(el)
      })

      rows.forEach((row, index: number) => {
        const rowKey = row.getAttribute('data-key')

        if (
          rowKey &&
          newChildrenArray.includes(rowKey) &&
          !row.classList.contains('Layer__table-empty-row')
        ) {
          row.classList.add('Layer__table-row--anim-starting-state')

          setTimeout(() => {
            row.classList.remove('Layer__table-row--anim-starting-state')
            row.classList.add('Layer__table-row--anim-complete-state')
          }, 10 * index)
        }
      })

      prevChildrenRef.current = currentChildren as string[]
    }
  }, [children])

  const tableWrapperClassNames = classNames(
    'Layer__table-wrapper',
    bottomSpacing && 'Layer__table-wrapper--bottom-spacing',
  )

  const tableClassNames = classNames(
    'Layer__table',
    componentName && `Layer__${componentName}__table`,
    borderCollapse && `Layer__table__${borderCollapse}-rows`,
  )
  return (
    <div className={tableWrapperClassNames}>
      <table className={tableClassNames} ref={tableRef}>
        {children}
      </table>
    </div>
  )
}
