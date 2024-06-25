import React, { ReactNode } from 'react'
import { useLayerContext } from '../../contexts/LayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import { PanelViewHeader } from '../PanelViewHeader/PanelViewHeader'

export interface PanelViewProps {
  children: ReactNode
  title?: string
  headerControls?: ReactNode
}

export const PanelView = ({
  title,
  children,
  headerControls,
}: PanelViewProps) => {
  const { theme } = useLayerContext()
  const styles = parseStylesFromThemeConfig(theme)

  return (
    <div className='Layer__panel_view' style={{ ...styles }}>
      <PanelViewHeader title={title} controls={headerControls} />
      <div className='Layer__panel_view-main'>{children}</div>
    </div>
  )
}
