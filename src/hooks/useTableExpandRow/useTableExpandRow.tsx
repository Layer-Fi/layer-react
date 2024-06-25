import { useContext, useEffect, useState } from 'react'
import { TableExpandContext } from '../../contexts/TableExpandContext'

const INDENTATION = 24

export const useTableExpandRow = (index: number, defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(index === 0 ? true : defaultOpen)
  const [showComponent, setShowComponent] = useState(false)
  const { tableExpandState } = useContext(TableExpandContext)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowComponent(true)
    }, index * 10)

    return () => clearTimeout(timeoutId)
  }, [index])

  useEffect(() => {
    setIsOpen(tableExpandState)
  }, [tableExpandState])

  return {
    isOpen,
    setIsOpen,
    showComponent,
    INDENTATION,
  }
}
