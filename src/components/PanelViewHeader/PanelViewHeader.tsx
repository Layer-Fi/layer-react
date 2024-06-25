import React, { ReactNode } from 'react'
import { Heading } from '../Typography'

export interface PanelViewHeaderProps {
  title?: string
  controls?: ReactNode
}

export const PanelViewHeader = ({ title, controls }: PanelViewHeaderProps) => {
  return (
    <div className='Layer__panel_view-header'>
      <div className='Layer__panel_view-header__content'>
        <Heading>{title}</Heading>
        {controls && (
          <div className='Layer__panel_view-header__controls'>{controls}</div>
        )}
      </div>
    </div>
  )
}
