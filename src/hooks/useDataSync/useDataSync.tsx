import React, { useState } from 'react'
import { DataModel } from '../../types/general'

type UseDataSync = () => {
  touch: (model: DataModel) => void
  read: (model: DataModel) => void
  syncTimestamps: Partial<Record<DataModel, number>>
  readTimestamps: Partial<Record<DataModel, number>>
  hasBeenTouched: (model: DataModel) => boolean
}

const ALL_TOUCHABLE = [
  DataModel.BUSINESS,
  DataModel.BANK_TRANSACTIONS,
  DataModel.LINKED_ACCOUNTS,
  DataModel.CHART_OF_ACCOUNTS,
  DataModel.JOURNAL,
]

const DEPENDENCIES: Partial<Record<DataModel, DataModel[]>> = {
  [DataModel.BALANCE_SHEET]: ALL_TOUCHABLE,
  [DataModel.CHART_OF_ACCOUNTS]: ALL_TOUCHABLE,
  [DataModel.JOURNAL]: ALL_TOUCHABLE,
  [DataModel.LEDGER_ACCOUNTS]: ALL_TOUCHABLE,
  [DataModel.LINKED_ACCOUNTS]: ALL_TOUCHABLE,
  [DataModel.PROFIT_AND_LOSS]: ALL_TOUCHABLE,
  [DataModel.STATEMENT_OF_CASH_FLOWS]: ALL_TOUCHABLE,
}

export const useDataSync: UseDataSync = () => {
  const [syncTimestamps, setSyncTimestamps] = useState<
    Partial<Record<DataModel, number>>
  >({})
  const [readTimestamps, setReadTimestamps] = useState<
    Partial<Record<DataModel, number>>
  >({})

  const touch = (model: DataModel) => {
    setSyncTimestamps({
      ...syncTimestamps,
      [model]: Date.now(),
    })
  }

  const read = (model: DataModel) => {
    setReadTimestamps({
      ...readTimestamps,
      [model]: Date.now(),
    })
  }

  const hasBeenTouched = (model: DataModel) => {
    if (!(model in DEPENDENCIES)) {
      return false
    }

    const lastRead = model in readTimestamps ? readTimestamps[model] : undefined

    if (!lastRead) {
      false
    }

    return Boolean(
      DEPENDENCIES[model]?.find(dep => {
        return (
          dep in syncTimestamps &&
          Boolean(syncTimestamps[dep]) &&
          (syncTimestamps[dep] as number) > (lastRead as number)
        )
      }),
    )
  }

  return {
    touch,
    read,
    syncTimestamps,
    readTimestamps,
    hasBeenTouched,
  }
}
