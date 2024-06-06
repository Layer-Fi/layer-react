import React, { ReactNode, useState } from 'react'

type UseDrawer = () => {
  content?: ReactNode
  setContent: (content: ReactNode) => void
  close: () => void
}

export const useDrawer: UseDrawer = () => {
  const [content, setContent] = useState<ReactNode>(undefined)

  const close = () => setContent(undefined)

  return {
    content,
    setContent,
    close,
  }
}
