import React, { ReactNode } from 'react'
import LoaderIcon from '../../icons/Loader'

export interface BadgeLoaderProps {
  children?: ReactNode
  size?: number
  variant?: 'default' | 'info'
}

export const BadgeLoader = ({ children, variant = 'default' }: BadgeLoaderProps) => {
  return (
    <span className={`Layer__loader Layer__loader--as-badge Layer__loader--${variant}`}>
      <LoaderIcon size={11} className='Layer__anim--rotating' />
      {children}
    </span>
  )
}
