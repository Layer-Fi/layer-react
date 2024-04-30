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

const calcPos = (
  parentRef?: RefObject<HTMLDivElement>,
  sidebarContentRef?: RefObject<HTMLDivElement>,
) => {
  if (!parentRef) {
    return 0
  }

  if (!parentRef?.current) {
    return 0
  }

  const windShift =
    parentRef?.current?.getBoundingClientRect().top < 0
      ? parentRef?.current?.getBoundingClientRect().top
      : 0

  const shift = parentRef?.current?.scrollTop - windShift
  if (shift < 0) {
    return 0
  }

  if (
    sidebarContentRef?.current?.offsetHeight &&
    parentRef?.current?.getBoundingClientRect().bottom <
      sidebarContentRef?.current?.offsetHeight
  ) {
    return (
      parentRef?.current?.offsetHeight -
      (sidebarContentRef?.current?.offsetHeight || 0) -
      4
    )
  }
  return shift
}

export const Panel = ({
  children,
  className,
  sidebar,
  header,
  sidebarIsOpen,
  parentRef,
}: PanelProps) => {
  const sidebarContentRef = useRef<HTMLDivElement>(null)
  const sidebarOpenRef = useRef(sidebarIsOpen)
  const [sidebarHeight, setSidebarHeight] = useState(0)
  const [mobileContentMaxHeight, setMobileContentMaxHeight] = useState<
    number | 'none'
  >('none')
  const [offset, setOffset] = useState(calcPos(parentRef, sidebarContentRef))

  useEffect(() => {
    if (parentRef?.current?.offsetHeight) {
      setSidebarHeight(parentRef?.current?.offsetHeight - 3)
      setOffset(calcPos(parentRef, sidebarContentRef))
    }
  }, [
    parentRef?.current?.offsetHeight,
    sidebarContentRef?.current?.offsetHeight,
    sidebarIsOpen,
  ])

  useEffect(() => {
    sidebarOpenRef.current = sidebarIsOpen
  }, [sidebarIsOpen])

  const updateMobileContentHeight = () => {
    if (sidebarOpenRef.current && parentRef?.current) {
      const newHeight = Math.min(
        parentRef.current.offsetHeight,
        window.innerHeight,
      )
      if (newHeight !== mobileContentMaxHeight) {
        setMobileContentMaxHeight(newHeight)
      }
    }
  }

  useEffect(() => {
    updateMobileContentHeight()
  }, [sidebarIsOpen])

  useEffect(() => {
    const onScroll = () => setOffset(calcPos(parentRef, sidebarContentRef))
    window.removeEventListener('scroll', onScroll)
    window.addEventListener('scroll', onScroll, { passive: true })
    parentRef?.current?.removeEventListener('scroll', onScroll)
    parentRef?.current?.addEventListener('scroll', onScroll)
    window.removeEventListener('resize', updateMobileContentHeight)
    window.addEventListener('resize', updateMobileContentHeight)
    return () => {
      window.removeEventListener('scroll', onScroll)
      parentRef?.current?.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', updateMobileContentHeight)
    }
  }, [])

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
            height: sidebarHeight > 0 && sidebarIsOpen ? sidebarHeight : 0,
          }}
        >
          <div
            className='Layer__panel__sidebar-content'
            style={{
              transform: `translateY(${offset}px)`,
              maxHeight: mobileContentMaxHeight,
              overflowY:
                mobileContentMaxHeight === 'none' ||
                mobileContentMaxHeight >
                  (sidebarContentRef?.current?.scrollHeight ?? 0)
                  ? 'auto'
                  : 'scroll',
            }}
            ref={sidebarContentRef}
          >
            {sidebar}
          </div>
        </div>
      )}
    </div>
  )
}
