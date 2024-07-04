import React, { ReactNode } from 'react'
import { ViewHeader } from '../../components/ViewHeader'
import { useLayerContext } from '../../contexts/LayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import classNames from 'classnames'

export interface ViewProps {
  children: ReactNode
  title?: string
  headerControls?: ReactNode
  type?: 'default' | 'panel'
}

export const View = ({ title, children, headerControls, type }: ViewProps) => {
  const { theme } = useLayerContext()
  const styles = parseStylesFromThemeConfig(theme)

  const viewClassName = classNames(
    'Layer__view',
    type === 'panel' && 'Layer__view--panel',
  )

  return (
    <div className={viewClassName} style={{ ...styles }}>
      <ViewHeader title={title} controls={headerControls} />
      <div className='Layer__view-main'>{children}</div>
    </div>
  )
}
