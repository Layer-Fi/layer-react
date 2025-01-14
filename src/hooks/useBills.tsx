import { useState } from 'react'

export type Bill = {
  id: string
  vendor: string
  dueDate: string
  billAmount: number
  openBalance: number
  status: string
}

type UseBills = () => {
  data: Bill[]
  billDetailsId?: string
  setBillDetailsId: (id: string | undefined) => void
  closeBillDetails: () => void
}

export const useBills: UseBills = () => {
  const [billDetailsId, setBillDetailsId] = useState<string | undefined>()
  const closeBillDetails = () => {
    setBillDetailsId(undefined)
  }

  // Mock data based on the image
  const data: Bill[] = [
    {
      id: '1',
      vendor: 'PG&E',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-09-15',
    },
    {
      id: '2',
      vendor: 'PG&E',
      dueDate: '10/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-10-09',
    },
    {
      id: '3',
      vendor: 'Norton Lumber...',
      dueDate: '11/01/2024',
      billAmount: 86.44,
      openBalance: 16.44,
      status: '2024-10-11',
    },
    {
      id: '4',
      vendor: 'Robertson & Anderson.',
      dueDate: '08/02/2024',
      billAmount: 86.44,
      openBalance: 8.0,
      status: '2024-10-12',
    },
    {
      id: '5',
      vendor: 'Bob\'s Burgers...',
      dueDate: '14/03/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-10-14',
    },
    {
      id: '6',
      vendor: 'Diego\'s Road...',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-10-25',
    },
    {
      id: '7',
      vendor: 'Diego\'s Road...',
      dueDate: '08/01/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-11-15',
    },
    {
      id: '8',
      vendor: 'Diego\'s Road...',
      dueDate: '14/03/2024',
      billAmount: 86.44,
      openBalance: 86.44,
      status: '2024-12-15',
    },
  ]

  return {
    data,
    billDetailsId,
    setBillDetailsId,
    closeBillDetails,
  }
}
