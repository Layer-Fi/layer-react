import { useContext, useEffect, useState } from 'react'
import { TableContext } from '../../contexts/TableContext'

export const useTableExpandRow = (index: number, defaultOpen = false) => {
  const [isOpen, setIsOpen] = useState(index === 0 ? true : defaultOpen)
  const { tableState } = useContext(TableContext)

  useEffect(() => {
    setIsOpen(tableState)
  }, [tableState])

  return {
    isOpen,
    setIsOpen,
  }
}
