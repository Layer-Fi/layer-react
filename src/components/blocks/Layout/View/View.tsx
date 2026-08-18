import { forwardRef, type ReactNode } from 'react'
import classNames from 'classnames'

import { parseStylesFromThemeConfig } from '@utils/shared/styles/colors'
import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { ViewHeader } from '@blocks/Layout/View/ViewHeader/ViewHeader'

import './view.scss'

type ViewClassName =
  | 'Layer__ViewRoot'
  | 'Layer__ViewMain'
  | 'Layer__ViewNotifications'

const legacyClassNames = createLegacyClassNames({
  'Layer__ViewRoot': 'Layer__view',
  'Layer__ViewMain': 'Layer__view-main',
  'Layer__ViewNotifications': 'Layer__view-notifications',
  'type:panel': 'Layer__view--panel',
} satisfies LegacyClassNameMapFor<ViewClassName, 'type:panel'>)

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
      legacyClassNames('Layer__ViewRoot', type === 'panel' && 'type:panel'),
      viewClassName,
    )

    return (
      <div className={viewClassNames} {...toDataProperties({ type: type ?? 'default' })} style={{ ...styles }} ref={ref}>
        {notification && (
          <div className={legacyClassNames('Layer__ViewNotifications')}>
            {notification}
          </div>
        )}
        {showHeader && (
          <ViewHeader title={title} withPaddings={Boolean(headerControls)}>
            {header ?? headerControls}
          </ViewHeader>
        )}
        {withSidebar
          ? (
            <Panel sidebarIsOpen={true} sidebar={sidebar} defaultSidebarHeight>
              <div className={legacyClassNames('Layer__ViewMain')}>{children}</div>
            </Panel>
          )
          : (
            <div className={legacyClassNames('Layer__ViewMain')}>{children}</div>
          )}
      </div>
    )
  },
)

View.displayName = 'View'

export { View }
