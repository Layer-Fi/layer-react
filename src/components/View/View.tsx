import React, { ReactNode } from 'react'
import { ViewHeader } from '../../components/ViewHeader'
import { useLayerContext } from '../../hooks/useLayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import { ToastsContainer } from '../Toast/Toast'

export interface ViewProps {
  children: ReactNode
  title?: string
  headerControls?: ReactNode
}

export const View = ({ title, children, headerControls }: ViewProps) => {
  const { theme, addToast } = useLayerContext()
  const styles = parseStylesFromThemeConfig(theme)

  return (
    <div className='Layer__view' style={{ ...styles }}>
      <ViewHeader title={title} controls={headerControls} />
      <div className='Layer__view-main'>{children}</div>
      <ToastsContainer />
      <button onClick={() => addToast({ content: 'This is a toast message' })}>add toast</button>
    </div>
  )
}
