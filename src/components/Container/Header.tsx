import React, { CSSProperties, ReactNode, forwardRef } from 'react'
import classNames from 'classnames'

export interface HeaderProps {
  className?: string
  style?: CSSProperties
  children: ReactNode
}

export const Header = forwardRef<HTMLElement, HeaderProps>(
  ({ className, children, style }, ref) => {
    const baseClassName = classNames('Layer__component-header', className)

    return (
      <header ref={ref} className={baseClassName} style={style}>
        {children}
      </header>
    )
  },
)
