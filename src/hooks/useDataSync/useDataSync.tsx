import { useState } from 'react'
import { DataModel } from '../../types/general'
import { useProfitAndLossGlobalInvalidator } from '../useProfitAndLoss/useProfitAndLossGlobalInvalidator'

type UseDataSync = () => {
  touch: (model: DataModel) => void
  read: (model: DataModel, cacheKey: string) => void
  syncTimestamps: Partial<Record<DataModel, number>>
  readTimestamps: Partial<Record<string, { t: number, m: DataModel }>>
  hasBeenTouched: (cacheKey: string) => boolean
  resetCaches: () => void
}

const ALL_TOUCHABLE = [
  DataModel.BUSINESS,
  DataModel.BANK_TRANSACTIONS,
  DataModel.LINKED_ACCOUNTS,
  DataModel.JOURNAL,
]

const DEPENDENCIES: Partial<Record<DataModel, DataModel[]>> = {
  [DataModel.BALANCE_SHEET]: ALL_TOUCHABLE,
  [DataModel.JOURNAL]: ALL_TOUCHABLE,
  [DataModel.LEDGER_ACCOUNTS]: ALL_TOUCHABLE,
  [DataModel.LINKED_ACCOUNTS]: [
    DataModel.BUSINESS,
    DataModel.LINKED_ACCOUNTS,
  ],
  [DataModel.PROFIT_AND_LOSS]: ALL_TOUCHABLE,
  [DataModel.STATEMENT_OF_CASH_FLOWS]: ALL_TOUCHABLE,
  [DataModel.BANK_TRANSACTIONS]: [
    DataModel.LINKED_ACCOUNTS,
    DataModel.BANK_TRANSACTIONS,
    DataModel.BUSINESS,
  ],
}

let readTimestampsG = {}

export const useDataSync: UseDataSync = () => {
  const initialTimestamp = Date.now()
  const [syncTimestamps, setSyncTimestamps] = useState<
    Partial<Record<DataModel, number>>
  >({
    [DataModel.BALANCE_SHEET]: initialTimestamp,
    [DataModel.JOURNAL]: initialTimestamp,
    [DataModel.LEDGER_ACCOUNTS]: initialTimestamp,
    [DataModel.LINKED_ACCOUNTS]: initialTimestamp,
    [DataModel.PROFIT_AND_LOSS]: initialTimestamp,
    [DataModel.STATEMENT_OF_CASH_FLOWS]: initialTimestamp,
    [DataModel.BANK_TRANSACTIONS]: initialTimestamp,
  })
  const [readTimestamps, setReadTimestamps] = useState<
    Partial<Record<string, { t: number, m: DataModel }>>
  >({})
  const { invalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()

  const touch = (model: DataModel) => {
    setSyncTimestamps({
      ...syncTimestamps,
      [model]: Date.now(),
    })
  }

  const read = (model: DataModel, cacheKey: string) => {
    readTimestampsG = {
      ...readTimestampsG,
      [cacheKey]: {
        t: Date.now(),
        m: model,
      },
    }
    setReadTimestamps({ ...readTimestampsG })
  }

  const hasBeenTouched = (cacheKey: string) => {
    const lastRead =
      cacheKey in readTimestamps ? readTimestamps[cacheKey] : undefined

    if (!lastRead || !lastRead?.m || !lastRead?.t) {
      return false
    }

    return Boolean(
      DEPENDENCIES[lastRead.m]?.find((dep) => {
        return (
          dep in syncTimestamps
          && Boolean(syncTimestamps[dep])
          && (syncTimestamps[dep] as number) > (lastRead.t)
        )
      }),
    )
  }

  const resetCaches = () => {
    const now = Date.now()
    void invalidateProfitAndLoss()
    setSyncTimestamps({
      [DataModel.BALANCE_SHEET]: now,
      [DataModel.JOURNAL]: now,
      [DataModel.LEDGER_ACCOUNTS]: now,
      [DataModel.LINKED_ACCOUNTS]: now,
      [DataModel.PROFIT_AND_LOSS]: now,
      [DataModel.STATEMENT_OF_CASH_FLOWS]: now,
      [DataModel.BANK_TRANSACTIONS]: now,
    })
  }

  return {
    touch,
    read,
    syncTimestamps,
    readTimestamps,
    hasBeenTouched,
    resetCaches,
  }
}
