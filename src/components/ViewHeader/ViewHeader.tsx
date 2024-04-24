import React, { ReactNode } from 'react'
import { Heading } from '../Typography'

export interface ViewHeaderProps {
  title?: string
  controls?: ReactNode
}

export const ViewHeader = ({ title, controls }: ViewHeaderProps) => {
  return (
    <div className='Layer__view-header'>
      <Heading>{title}</Heading>
      {controls && (
        <div className='Layer__view-header__controls'>{controls}</div>
      )}
    </div>
  )
}
