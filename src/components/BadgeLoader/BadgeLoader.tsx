import React, { ReactNode } from 'react'
import LoaderIcon from '../../icons/Loader'

export interface BadgeLoaderProps {
  children?: ReactNode
  size?: number
}

export const BadgeLoader = ({ children }: BadgeLoaderProps) => {
  return (
    <span className='Layer__loader Layer__loader--as-badge'>
      <LoaderIcon size={11} className='Layer__anim--rotating' />
      {children}
    </span>
  )
}
