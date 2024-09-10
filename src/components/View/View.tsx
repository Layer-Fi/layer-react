import React, { forwardRef, ReactNode } from 'react'
import { ViewHeader } from '../../components/ViewHeader'
import { useLayerContext } from '../../contexts/LayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import { Panel } from '../Panel'
import classNames from 'classnames'

export interface ViewProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  headerControls?: ReactNode
  type?: 'default' | 'panel'
  withSidebar?: boolean
  sidebar?: ReactNode
  viewClassName?: string
}

export const View = forwardRef<HTMLDivElement, ViewProps>(
  (
    {
      title,
      showHeader= true,
      children,
      headerControls,
      type,
      withSidebar = false,
      sidebar,
      viewClassName,
    },
    ref,
  ) => {
    const { theme } = useLayerContext()
    const styles = parseStylesFromThemeConfig(theme)

    const viewClassNames = classNames(
      'Layer__view',
      type === 'panel' && 'Layer__view--panel',
      viewClassName,
    )

    return (
      <div className={viewClassNames} style={{ ...styles }} ref={ref}>
        {showHeader && (<ViewHeader title={title} controls={headerControls} />)}
        {withSidebar ? (
          <Panel sidebarIsOpen={true} sidebar={sidebar} defaultSidebarHeight>
            <div className='Layer__view-main'>{children}</div>
          </Panel>
        ) : (
          <div className='Layer__view-main'>{children}</div>
        )}
      </div>
    )
  },
)
