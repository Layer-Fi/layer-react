import React from 'react'
import { TableProps } from '../../types/table'
import classNames from 'classnames'

export const Table = ({
  componentName,
  children,
  borderCollapse = 'separate',
}: TableProps) => {
  const tableClassNames = classNames(
    'Layer__table',
    componentName && `Layer__${componentName}__table`,
    borderCollapse && `Layer__table__${borderCollapse}-rows`,
  )
  return <table className={tableClassNames}>{children}</table>
}
