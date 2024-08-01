import React from 'react'
import LoaderIcon from '../../icons/Loader'

export interface SmallLoaderProps {
  size?: number
}

export const SmallLoader = ({ size = 28 }: SmallLoaderProps) => {
  return (
    <span
      className='Layer__loader Layer__loader--with-bg'
      style={{ width: size, height: size }}
    >
      <LoaderIcon className='Layer__anim--rotating' size={size - 16} />
    </span>
  )
}
