import React, { ReactNode } from 'react'
import ChevronRightIcon from '../../icons/ChevronRight'
import { IconButton } from '../Button'
import classNames from 'classnames'

export interface NotificationCardProps {
  onClick: () => void
  children: ReactNode
  bottomBar?: ReactNode
  className?: string
}

export const NotificationCard = ({
  onClick,
  children,
  bottomBar,
  className,
}: NotificationCardProps) => {
  return (
    <div className={classNames('Layer__notification-card', className)}>
      <div className='Layer__notification-card__content'>
        <div className='Layer__notification-card__main'>{children}</div>
        <IconButton
          icon={<ChevronRightIcon />}
          withBorder
          onClick={() => onClick()}
        />
      </div>
      {bottomBar && (
        <div className='Layer__notification-card__bottom-bar'>{bottomBar}</div>
      )}
    </div>
  )
}
