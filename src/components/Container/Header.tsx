import React, { ReactNode } from 'react'
import classNames from 'classnames'

export interface HeaderProps {
  className?: string
  children: ReactNode
}

export const Header = ({ className, children }: HeaderProps) => {
  const baseClassName = classNames('Layer__component-header', className)

  return <header className={baseClassName}>{children}</header>
}
