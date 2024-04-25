import React, { ReactNode } from 'react'
import ChevronRightIcon from '../../icons/ChevronRight'
import { IconButton } from '../Button'

export interface NotificationCardProps {
  onClick: () => void
  children: ReactNode
}

export const NotificationCard = ({
  onClick,
  children,
}: NotificationCardProps) => {
  return (
    <div className='Layer__notification-card'>
      <div className='Layer__notification-card__main'>{children}</div>
      <IconButton
        icon={<ChevronRightIcon />}
        withBorder
        onClick={() => onClick()}
      />
    </div>
  )
}
