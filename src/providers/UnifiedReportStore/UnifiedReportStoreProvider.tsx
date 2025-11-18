import { useState, createContext, useContext, type PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'
import { ReportEnum, type DateQueryParams, type DateRangeQueryParams } from '@schemas/reports/unifiedReport'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useGlobalDate, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

type UnifiedReportStoreShape = { report: ReportEnum }

export enum UnifiedReportDateVariant {
  Date = 'Date',
  DateRange = 'DateRange',
}

const reportToDateVariantMap = {
  [ReportEnum.BalanceSheet]: UnifiedReportDateVariant.Date,
  [ReportEnum.CashflowStatement]: UnifiedReportDateVariant.DateRange,
} as const

export type UnifiedReportWithDateParams =
  | {
    report: ReportEnum.BalanceSheet
  } & DateQueryParams
  | {
    report: ReportEnum.CashflowStatement
  } & DateRangeQueryParams

const UnifiedReportStoreContext = createContext(
  createStore<UnifiedReportStoreShape>(() => ({
    report: ReportEnum.CashflowStatement,
  })),
)

export function useUnifiedReportDateVariant(): UnifiedReportDateVariant {
  const store = useContext(UnifiedReportStoreContext)

  const report = useStore(store, state => state.report)
  return reportToDateVariantMap[report]
}

export function useUnifiedReportWithDateParams(): UnifiedReportWithDateParams {
  const store = useContext(UnifiedReportStoreContext)
  const { date: effectiveDate } = useGlobalDate()
  const { startDate, endDate } = useGlobalDateRange({ displayMode: 'full' })

  const report = useStore(store, state => state.report)
  const dateVariant = reportToDateVariantMap[report]

  switch (dateVariant) {
    case UnifiedReportDateVariant.Date:
      return { report, effectiveDate } as UnifiedReportWithDateParams
    case UnifiedReportDateVariant.DateRange:
      return { report, startDate, endDate } as UnifiedReportWithDateParams
    default:
      unsafeAssertUnreachable({
        value: dateVariant,
        message: 'Unexpected date variant',
      })
  }
}

export function UnifiedReportStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<UnifiedReportStoreShape>(() => ({
      report: ReportEnum.CashflowStatement,
    })),
  )

  return (
    <UnifiedReportStoreContext.Provider value={store}>
      {props.children}
    </UnifiedReportStoreContext.Provider>
  )
}
