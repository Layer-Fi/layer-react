import React, { useContext, useEffect } from 'react'
import { DrawerContext } from '../../contexts/DrawerContext'
import { useSizeClass } from '../../hooks/useWindowSize'
import { Drawer } from '../Drawer'
import { ToastsContainer } from '../Toast/Toast'

const DrawerWidget = () => {
  const { content, close } = useContext(DrawerContext)

  const { isMobile, isTablet } = useSizeClass()

  useEffect(() => {
    if (!isMobile && !isTablet && content) {
      close()
    }
  }, [isMobile])

  return (
    <Drawer isOpen={Boolean(content)} onClose={close}>
      {content}
    </Drawer>
  )
}

export const GlobalWidgets = () => {
  return (
    <>
      <ToastsContainer />
      <DrawerWidget />
    </>
  )
}
