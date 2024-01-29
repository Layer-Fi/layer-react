import React, { ReactNode } from 'react'
import LoaderIcon from '../../icons/Loader'

export interface LoaderProps {
  children?: ReactNode
}

export const Loader = ({ children }: LoaderProps) => {
  return (
    <span className='Layer__loader'>
      <LoaderIcon size={14} className='Layer__anim--rotating' />
      {children ?? 'Loading...'}
    </span>
  )
}
