import classNames from 'classnames'

import { type TableProps } from '@internal-types/table'

export const Table = ({
  componentName,
  children,
  borderCollapse = 'separate',
  bottomSpacing = true,
}: TableProps) => {
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
      <table className={tableClassNames}>
        {children}
      </table>
    </div>
  )
}
