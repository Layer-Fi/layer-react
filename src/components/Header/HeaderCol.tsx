import React, { CSSProperties, ReactNode } from 'react'
import classNames from 'classnames'

interface HeaderColProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export const HeaderCol = ({ className, children, style }: HeaderColProps) => (
  <div className={classNames('Layer__header__col', className)} style={style}>
    {children}
  </div>
)
