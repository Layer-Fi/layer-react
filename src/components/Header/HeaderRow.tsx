import React, { CSSProperties, ReactNode } from 'react'
import classNames from 'classnames'

interface HeaderRowProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export const HeaderRow = ({ className, children, style }: HeaderRowProps) => (
  <div className={classNames('Layer__header__row', className)} style={style}>
    {children}
  </div>
)
