import { ReactNode } from 'react'
import classNames from 'classnames'

export interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = ({ children, className }: CardProps) => {
  return <div className={classNames('Layer__card', className)}>{children}</div>
}
