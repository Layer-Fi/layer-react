import { type ReactNode, type RefObject, useEffect, useState } from 'react'
import classNames from 'classnames'

import './panel.scss'

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

  const sidebarClass = classNames(
    'Layer__panel__sidebar',
    defaultSidebarHeight && 'Layer__panel__sidebar--default',
    floating && 'Layer__panel__sidebar--floating',
  )

  return (
    <div
      className={classNames(
        'Layer__panel',
        className,
        sidebarIsOpen && 'Layer__panel--open',
      )}
    >
      <div className='Layer__panel__content'>
        {header}
        {children}
      </div>
      {sidebar && (
        <div
          className={sidebarClass}
          style={
            !defaultSidebarHeight
              ? {
                maxHeight:
                    sidebarHeight > 0 && sidebarIsOpen ? sidebarHeight : 0,
              }
              : {}
          }
        >
          <div className='Layer__panel__sidebar-content'>{sidebar}</div>
        </div>
      )}
    </div>
  )
}
