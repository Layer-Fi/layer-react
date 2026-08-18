import { type ReactNode, type RefObject, useEffect, useState } from 'react'
import classNames from 'classnames'

import { createLegacyClassNames, type LegacyClassNameMapFor } from '@utils/shared/styles/legacyClassNames'
import { toDataProperties } from '@utils/shared/styles/toDataProperties'

import './panel.scss'

type ViewPanelClassName =
  | 'Layer__ViewPanel'
  | 'Layer__ViewPanel__Content'
  | 'Layer__ViewPanel__Sidebar'
  | 'Layer__ViewPanel__SidebarContent'

const legacyClassNames = createLegacyClassNames({
  'Layer__ViewPanel': 'Layer__panel',
  'Layer__ViewPanel__Content': 'Layer__panel__content',
  'Layer__ViewPanel__Sidebar': 'Layer__panel__sidebar',
  'Layer__ViewPanel__SidebarContent': 'Layer__panel__sidebar-content',
  'state:open': 'Layer__panel--open',
  'state:defaultHeight': 'Layer__panel__sidebar--default',
  'state:floating': 'Layer__panel__sidebar--floating',
} satisfies LegacyClassNameMapFor<ViewPanelClassName, `state:${string}`>)

export interface PanelProps {
  children: ReactNode
  className?: string
  sidebar?: ReactNode
  sidebarIsOpen?: boolean
  header?: ReactNode
  parentRef?: RefObject<HTMLDivElement>
  defaultSidebarHeight?: boolean
  floating?: boolean
}

export const Panel = ({
  children,
  className,
  sidebar,
  header,
  sidebarIsOpen,
  parentRef,
  defaultSidebarHeight = false,
  floating = false,
}: PanelProps) => {
  const [sidebarHeight, setSidebarHeight] = useState(0)

  useEffect(() => {
    if (parentRef?.current?.offsetHeight) {
      setSidebarHeight(parentRef?.current?.offsetHeight)
    }
  }, [parentRef, parentRef?.current?.offsetHeight, sidebarIsOpen])

  return (
    <div
      className={classNames(
        legacyClassNames('Layer__ViewPanel', sidebarIsOpen && 'state:open'),
        className,
      )}
      {...toDataProperties({ open: Boolean(sidebarIsOpen) })}
    >
      <div className={legacyClassNames('Layer__ViewPanel__Content')}>
        {header}
        {children}
      </div>
      {sidebar && (
        <div
          className={legacyClassNames(
            'Layer__ViewPanel__Sidebar',
            defaultSidebarHeight && 'state:defaultHeight',
            floating && 'state:floating',
          )}
          {...toDataProperties({ 'default-height': defaultSidebarHeight, floating })}
          style={
            !defaultSidebarHeight
              ? {
                maxHeight:
                    sidebarHeight > 0 && sidebarIsOpen ? sidebarHeight : 0,
              }
              : {}
          }
        >
          <div className={legacyClassNames('Layer__ViewPanel__SidebarContent')}>{sidebar}</div>
        </div>
      )}
    </div>
  )
}
