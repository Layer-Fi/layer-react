import { type ReactNode } from 'react'
import classNames from 'classnames'

import { Heading } from '@components/Typography/Heading'

export interface ViewHeaderProps {
  title?: string
  className?: string
  children?: ReactNode
  headerActions?: ReactNode
}

export const ViewHeader = ({ title, className, children, headerActions }: ViewHeaderProps) => {
  return (
    <div className={classNames('Layer__view-header', className)}>
      <div className='Layer__view-header__content'>
        {title && (
          <Heading className='Layer__view-header__title'>{title}</Heading>
        )}
        {children && (
          <div className='Layer__view-header__children'>{children}</div>
        )}
        {headerActions && (
          <div className='Layer__view-header__actions'>{headerActions}</div>
        )}
      </div>
    </div>
  )
}
