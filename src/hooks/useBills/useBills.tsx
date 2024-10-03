import { useState } from 'react'

export type BillType = {
  vendor: string
  dueDate: string
  billAmount: number
  openBalance: number
  status: string
}

type UseBills = () => {
  data: BillType[]
  selectedEntryId: string | undefined
  setSelectedEntryId: (id: string | undefined) => void
  closeSelectedEntry: () => void
  billDetailsId?: string
  setBillDetailsId: (id: string | undefined) => void
  closeBillDetails: () => void
}

export const useBills: UseBills = () => {
  const [selectedEntryId, setSelectedEntryId] = useState<string | undefined>()
  const [billDetailsId, setBillDetailsId] = useState<string | undefined>()
  const closeSelectedEntry = () => {
    setSelectedEntryId(undefined)
  }
  const closeBillDetails = () => {
    setBillDetailsId(undefined)
  }

  // Mock data based on the image
  const data: BillType[] = [
    {
      vendor: 'PG&E',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: 'Overdue',
    },
    {
      vendor: 'PG&E',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: 'Overdue',
    },
    {
      vendor: 'Norton Lumber...',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 16.44,
      status: 'Overdue',
    },
    {
      vendor: 'Robertson & A...',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 8.0,
      status: 'Due today',
    },
    {
      vendor: "Bob's Burgers...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: 'Due today',
    },
    {
      vendor: "Diego's Road...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: 'Due in 1 day',
    },
    {
      vendor: "Diego's Road...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: 'Due in 10 days',
    },
    {
      vendor: "Diego's Road...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: 'Due in 21 days',
    },
  ]

  return {
    data,
    selectedEntryId,
    setSelectedEntryId,
    closeSelectedEntry,
    billDetailsId,
    setBillDetailsId,
    closeBillDetails,
  }
}
