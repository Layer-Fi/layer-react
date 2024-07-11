import React, { ReactNode, useState } from 'react'
import { DataModel } from '../../types/general'

type UseDataSync = () => {
  touch: (model: DataModel) => void
  syncTimestamps: Partial<Record<DataModel, number>>
}

export const useDataSync: UseDataSync = () => {
  const [syncTimestamps, setSyncTimestamps] = useState<
    Partial<Record<DataModel, number>>
  >({})

  const touch = (model: DataModel) => {
    setSyncTimestamps({
      ...syncTimestamps,
      [model]: Date.now(),
    })
  }

  return {
    touch,
    syncTimestamps,
  }
}
