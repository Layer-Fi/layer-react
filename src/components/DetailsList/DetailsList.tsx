import React, { ReactNode } from 'react'
import { Header } from '../Container'
import { Heading, HeadingSize } from '../Typography'
import classNames from 'classnames'

export interface DetailsListProps {
  title?: string
  className?: string
  children: ReactNode
  actions?: ReactNode
}

export const DetailsList = ({
  title,
  children,
  className,
  actions,
}: DetailsListProps) => {
  return (
    <div className={classNames('Layer__details-list', className)}>
      {title && (
        <Header>
          <Heading size={HeadingSize.secondary}>{title}</Heading>
          {actions && (
            <div className='Layer__details-list__actions'>{actions}</div>
          )}
        </Header>
      )}
      <ul className='Layer__details-list__list'>{children}</ul>
    </div>
  )
}
