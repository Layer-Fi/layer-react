import React from 'react'
import { TableHeadProps } from '../../types/table'
import classNames from 'classnames'

export const TableHead = ({ children }: TableHeadProps) => {
  const theadClassNames = classNames('Layer__table-header')

  return <thead className={theadClassNames}>{children}</thead>
}
