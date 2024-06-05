import React, { ReactNode, RefObject, useEffect, useRef, useState } from 'react'
import classNames from 'classnames'

export interface PanelProps {
  children: ReactNode
  className?: string
  sidebar?: ReactNode
  sidebarIsOpen?: boolean
  header?: ReactNode
  parentRef?: RefObject<HTMLDivElement>
}

export const Panel = ({
  children,
  className,
  sidebar,
  header,
  sidebarIsOpen,
  parentRef,
}: PanelProps) => {
  const [sidebarHeight, setSidebarHeight] = useState(0)

  useEffect(() => {
    if (parentRef?.current?.offsetHeight) {
      setSidebarHeight(parentRef?.current?.offsetHeight - 1)
    }
  }, [parentRef?.current?.offsetHeight, sidebarIsOpen])

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
          className='Layer__panel__sidebar'
          style={{
            maxHeight: sidebarHeight > 0 && sidebarIsOpen ? sidebarHeight : 0,
          }}
        >
          <div className='Layer__panel__sidebar-content'>{sidebar}</div>
        </div>
      )}
    </div>
  )
}
