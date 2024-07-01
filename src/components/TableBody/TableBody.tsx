import React from 'react'
import { TableHeadProps } from '../../types/table'
import classNames from 'classnames'

export const TableBody = ({ children }: TableHeadProps) => {
  const tbodyClassNames = classNames('Layer__table-body')

  return <tbody className={tbodyClassNames}>{children}</tbody>
}
