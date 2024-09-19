import React, { ReactNode, useState } from 'react'

type UseDrawer = () => {
  content?: ReactNode
  setContent: (content: ReactNode) => void
  finishClosing: () => void
  isClosing: boolean
  close: () => void
}

export const useDrawer: UseDrawer = () => {
  const [content, setContent] = useState<ReactNode>(undefined)
  const [isClosing, setIsClosing] = useState(false)

  const close = () => {
    setIsClosing(true)
  }

  const finishClosing = () => {
    setContent(undefined)
    setIsClosing(false)
  }

  return {
    content,
    setContent,
    finishClosing,
    isClosing,
    close,
  }
}
