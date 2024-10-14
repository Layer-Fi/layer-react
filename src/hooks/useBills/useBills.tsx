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
      status: '2024-09-15',
    },
    {
      vendor: 'PG&E',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-10-09',
    },
    {
      vendor: 'Norton Lumber...',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 16.44,
      status: '2024-10-11',
    },
    {
      vendor: 'Robertson & A...',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 8.0,
      status: '2024-10-12',
    },
    {
      vendor: "Bob's Burgers...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-10-14',
    },
    {
      vendor: "Diego's Road...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-10-25',
    },
    {
      vendor: "Diego's Road...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-11-15',
    },
    {
      vendor: "Diego's Road...",
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-12-15',
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
