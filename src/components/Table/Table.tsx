import { useEffect, useRef } from 'react'
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
      const currentChildren = rows.map(
        child =>
          child.getAttribute('data-key') && {
            key: child.getAttribute('data-key'),
            child,
          },
      )
      const newChildrenKeys: string[] = []

      const newChildrenArray = currentChildren.filter(el => {
        if (el && el.key) {
          newChildrenKeys.push(el.key)
        }
        return el && el.key && !prevChildrenArray.includes(el.key)
      })

      newChildrenArray.forEach((row, index: number) => {
        const rowKey = row && row.key
        if (rowKey && !row.child.classList.contains('Layer__table-empty-row')) {
          row.child.classList.add('Layer__table-row--anim-starting-state')

          setTimeout(() => {
            row.child.classList.add('Layer__table-row--anim-complete-state')
            row.child.classList.remove('Layer__table-row--anim-starting-state')
          }, 15 * index)
        }
      })

      prevChildrenRef.current = newChildrenKeys as string[]
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
