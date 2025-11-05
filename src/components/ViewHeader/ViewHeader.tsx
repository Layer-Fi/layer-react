import { Heading } from '../Typography/Heading'
import { ReactNode } from 'react'
import classNames from 'classnames'

export interface ViewHeaderProps {
  title?: string
  className?: string
  children?: ReactNode
}

export const ViewHeader = ({ title, className, children }: ViewHeaderProps) => {
  return (
    <div className={classNames('Layer__view-header', className)}>
      <div className='Layer__view-header__content'>
        {title && (
          <Heading className='Layer__view-header__title'>{title}</Heading>
        )}
        {children && (
          <div className='Layer__view-header__children'>{children}</div>
        )}
      </div>
    </div>
  )
}
