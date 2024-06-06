import React, { useContext, useState } from 'react'
import { DrawerContext } from '../../contexts/DrawerContext'
import { Drawer } from '../Drawer'

const DrawerWidget = () => {
  const { content, close } = useContext(DrawerContext)

  return (
    <Drawer isOpen={Boolean(content)} onClose={close}>
      {content}
    </Drawer>
  )
}

export const GlobalWidgets = () => {
  return <DrawerWidget />
}
