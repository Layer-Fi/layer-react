import { forwardRef, type ReactNode } from 'react'

import { parseStylesFromThemeConfig } from '@utils/shared/styles/colors'
import { withLegacy } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { LAYOUT_CLASS_NAMES } from '@blocks/Layout/layoutClassNames'
import { Panel } from '@blocks/Layout/View/Panel/Panel'
import { ViewHeader } from '@blocks/Layout/View/ViewHeader/ViewHeader'

import './view.scss'

export type ViewLayout = 'default' | 'panel'
export type ViewPadding = 'default' | 'none'

export interface ViewProps {
  children: ReactNode
  title?: string
  showHeader?: boolean
  header?: ReactNode
  layout?: ViewLayout
  /** `none` lets the body run to the edge, for a view that draws its own chrome. */
  padding?: ViewPadding
  withSidebar?: boolean
  sidebar?: ReactNode
  /** Renders the sidebar without its own border or background. */
  sidebarVariant?: 'default' | 'plain'
  className?: string
}

const View = forwardRef<HTMLDivElement, ViewProps>(
  (
    {
      title,
      showHeader = true,
      children,
      header,
      layout = 'default',
      padding = 'default',
      withSidebar = false,
      sidebar,
      sidebarVariant = 'default',
      className,
    },
    ref,
  ) => {
    const { theme } = useLayerContext()

    const main = (
      <div
        {...toDataProperties({ padding, 'with-sidebar': withSidebar })}
        className={withLegacy(LAYOUT_CLASS_NAMES.VIEW_MAIN)}
      >
        {children}
      </div>
    )

    return (
      <div
        ref={ref}
        {...toDataProperties({ layout })}
        className={withLegacy(
          LAYOUT_CLASS_NAMES.VIEW,
          layout === 'panel' && LAYOUT_CLASS_NAMES.VIEW_PANEL_LAYOUT.legacy,
          className,
        )}
        style={parseStylesFromThemeConfig(theme)}
      >
        {showHeader && (
          <ViewHeader
            title={title}
            padding={layout === 'panel' ? 'none' : 'default'}
            slots={{ Actions: header }}
          />
        )}
        {withSidebar
          ? (
            <Panel sidebarIsOpen sidebar={sidebar} sidebarVariant={sidebarVariant} defaultSidebarHeight>
              {main}
            </Panel>
          )
          : main}
      </div>
    )
  },
)

View.displayName = 'View'

export { View }
