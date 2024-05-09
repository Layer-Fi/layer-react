import React, { ReactNode } from 'react'
import LoaderIcon from '../../icons/Loader'

export interface LoaderProps {
  children?: ReactNode
  size?: number
}

export const Loader = ({ children, size = 28 }: LoaderProps) => {
  return (
    <span className='Layer__loader'>
      <LoaderIcon size={size} className='Layer__anim--rotating' />
      {children}
    </span>
  )
}
