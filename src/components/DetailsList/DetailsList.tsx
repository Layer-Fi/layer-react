import { ReactNode } from 'react'
import { Header } from '../Container'
import { Heading, HeadingSize } from '../Typography'
import classNames from 'classnames'

export interface DetailsListProps {
  title?: string
  className?: string
  titleClassName?: string
  children: ReactNode
  actions?: ReactNode
}

export const DetailsList = ({
  title,
  children,
  className,
  titleClassName,
  actions,
}: DetailsListProps) => {
  return (
    <div className={classNames('Layer__details-list', className)}>
      {title && (
        <Header className={titleClassName}>
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
