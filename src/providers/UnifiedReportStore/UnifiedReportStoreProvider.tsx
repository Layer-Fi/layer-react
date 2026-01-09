import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import { DateGroupBy, type DateQueryParams, type DateRangeQueryParams, ReportEnum } from '@schemas/reports/unifiedReport'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { type DateSelectionMode, useGlobalDate, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

type UnifiedReportStoreActions = {
  setReport: (report: ReportEnum) => void
  setGroupBy: (groupBy: DateGroupBy | null) => void
}

type UnifiedReportStoreShape = {
  report: ReportEnum
  groupBy: DateGroupBy | null
  actions: UnifiedReportStoreActions
}

export enum UnifiedReportDateVariant {
  Date = 'Date',
  DateRange = 'DateRange',
}

const reportToDateVariantMap = {
  [ReportEnum.BalanceSheet]: UnifiedReportDateVariant.Date,
  [ReportEnum.CashflowStatement]: UnifiedReportDateVariant.DateRange,
  [ReportEnum.ProfitAndLoss]: UnifiedReportDateVariant.DateRange,
} as const

export type UnifiedReportWithDateParams =
  | {
    report: ReportEnum.BalanceSheet
  } & DateQueryParams
  | {
    report: ReportEnum.CashflowStatement
  } & DateRangeQueryParams
  | {
    report: ReportEnum.ProfitAndLoss
  } & DateRangeQueryParams

export type UnifiedReportState = UnifiedReportWithDateParams & {
  groupBy: DateGroupBy | null
}

const UnifiedReportStoreContext = createContext(
  createStore<UnifiedReportStoreShape>(() => ({
    report: ReportEnum.ProfitAndLoss,
    groupBy: DateGroupBy.AllTime,
    actions: {
      setReport: () => {},
      setGroupBy: () => {},
    },
  })),
)

export function useUnifiedReportDateVariant(): UnifiedReportDateVariant {
  const store = useContext(UnifiedReportStoreContext)

  const report = useStore(store, state => state.report)
  return reportToDateVariantMap[report]
}

export function useUnifiedReportGroupBy() {
  const store = useContext(UnifiedReportStoreContext)
  const report = useStore(store, state => state.report)
  const groupBy = useStore(store, state => state.groupBy)
  const setGroupBy = useStore(store, state => state.actions.setGroupBy)

  const groupByState = useMemo(() => ({ groupBy, setGroupBy }), [groupBy, setGroupBy])

  if (report === ReportEnum.ProfitAndLoss) {
    return groupByState
  }

  return null
}

export function useUnifiedReportDateParams({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }): DateQueryParams | DateRangeQueryParams {
  const store = useContext(UnifiedReportStoreContext)
  const { date: effectiveDate } = useGlobalDate({ dateSelectionMode })
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode })

  const report = useStore(store, state => state.report)
  const dateVariant = reportToDateVariantMap[report]

  switch (dateVariant) {
    case UnifiedReportDateVariant.Date:
      return { effectiveDate }
    case UnifiedReportDateVariant.DateRange:
      return { startDate, endDate }
    default:
      unsafeAssertUnreachable({
        value: dateVariant,
        message: 'Unexpected date variant',
      })
  }
}

export function useUnifiedReportState({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }): UnifiedReportState {
  const store = useContext(UnifiedReportStoreContext)
  const report = useStore(store, state => state.report)

  const groupByParam = useUnifiedReportGroupBy()
  const dateParams = useUnifiedReportDateParams({ dateSelectionMode })

  return { report, groupBy: groupByParam?.groupBy ?? null, ...dateParams } as UnifiedReportState
}

export function UnifiedReportStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<UnifiedReportStoreShape>(set => ({
      report: ReportEnum.ProfitAndLoss,
      groupBy: DateGroupBy.AllTime,
      actions: {
        setReport: (report: ReportEnum) => set({ report }),
        setGroupBy: (groupBy: DateGroupBy | null) => set({ groupBy }),
      },
    })),
  )

  return (
    <UnifiedReportStoreContext.Provider value={store}>
      {props.children}
    </UnifiedReportStoreContext.Provider>
  )
}
