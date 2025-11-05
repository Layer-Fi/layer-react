import { forwardRef, ReactNode } from 'react'
import { ViewHeader } from '../ViewHeader/ViewHeader'
import { useLayerContext } from '../../contexts/LayerContext/LayerContext'
import { parseStylesFromThemeConfig } from '../../utils/colors'
import { Panel } from '../Panel/Panel'
import classNames from 'classnames'

export interface ViewProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  header?: ReactNode
  headerControls?: ReactNode // @deprecated
  type?: 'default' | 'panel'
  withSidebar?: boolean
  sidebar?: ReactNode
  viewClassName?: string
  notification?: ReactNode
}

const View = forwardRef<HTMLDivElement, ViewProps>(
  (
    {
      title,
      showHeader = true,
      children,
      headerControls,
      header,
      type,
      withSidebar = false,
      sidebar,
      viewClassName,
      notification,
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
        {notification && (
          <div className='Layer__view-notifications'>
            {notification}
          </div>
        )}
        {showHeader && (
          <ViewHeader
            title={title}
            className={classNames(
              headerControls ? 'Layer__view-header--paddings' : undefined,
            )}
          >
            {header ?? headerControls}
          </ViewHeader>
        )}
        {withSidebar
          ? (
            <Panel sidebarIsOpen={true} sidebar={sidebar} defaultSidebarHeight>
              <div className='Layer__view-main'>{children}</div>
            </Panel>
          )
          : (
            <div className='Layer__view-main'>{children}</div>
          )}
      </div>
    )
  },
)

View.displayName = 'View'

export { View }
