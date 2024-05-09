import React, { ReactNode } from 'react'
import ChevronRightIcon from '../../icons/ChevronRight'
import { IconButton } from '../Button'
import classNames from 'classnames'

export interface NotificationCardProps {
  onClick: () => void
  children: ReactNode
  className?: string
}

export const NotificationCard = ({
  onClick,
  children,
  className,
}: NotificationCardProps) => {
  return (
    <div className={classNames('Layer__notification-card', className)}>
      <div className='Layer__notification-card__main'>{children}</div>
      <IconButton
        icon={<ChevronRightIcon />}
        withBorder
        onClick={() => onClick()}
      />
    </div>
  )
}
