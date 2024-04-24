import React, { ReactNode } from 'react'
import { ViewHeader } from '../../components/ViewHeader'
import { useLayerContext } from '../../hooks/useLayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'

export interface ViewProps {
  children: ReactNode
  title?: string
  headerControls?: ReactNode
}

export const View = ({ title, children, headerControls }: ViewProps) => {
  const { theme } = useLayerContext()

  const styles = parseStylesFromThemeConfig(theme)

  return (
    <div className='Layer__view' style={{ ...styles }}>
      <ViewHeader title={title} controls={headerControls} />
      <div className='Layer__view-main'>{children}</div>
    </div>
  )
}
