import React, { ReactNode } from 'react'
import { ViewHeader } from '../../components/ViewHeader'

export interface ViewProps {
  children: ReactNode
  title?: string
  headerControls?: ReactNode
}

export const View = ({ title, children, headerControls }: ViewProps) => {
  return (
    <div className='Layer__view'>
      <ViewHeader title={title} controls={headerControls} />
      <div className='Layer__view-main'>{children}</div>
    </div>
  )
}
