import { useState, createContext, useContext, type PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'
import { ReportEnum, type UnifiedReportDateQueryParams } from '../../schemas/reports/unifiedReport'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { useGlobalDate, useGlobalDateRange } from '../GlobalDateStore/GlobalDateStoreProvider'

type UnifiedReportRouteState = { report: ReportEnum }
type UnifiedReportStoreShape = {
  route: UnifiedReportRouteState
}

export enum UnifiedReportDateVariant {
  Date = 'Date',
  DateRange = 'DateRange',
}

export const getDateVariantForReportType = (reportType: ReportEnum): UnifiedReportDateVariant => {
  switch (reportType) {
    case ReportEnum.BalanceSheet:
      return UnifiedReportDateVariant.Date
    case ReportEnum.CashflowStatement:
      return UnifiedReportDateVariant.DateRange
    default:
      unsafeAssertUnreachable({
        value: reportType,
        message: 'Unexpected report type',
      })
  }
}

const UnifiedReportStoreContext = createContext(
  createStore<UnifiedReportStoreShape>(() => ({
    route: { report: ReportEnum.CashflowStatement },
  })),
)

export function useUnifiedReportType() {
  const store = useContext(UnifiedReportStoreContext)
  return useStore(store, state => state.route)
}

export function useUnifiedReportDateVariant(): UnifiedReportDateVariant {
  const store = useContext(UnifiedReportStoreContext)

  const report = useStore(store, state => state.route.report)
  return getDateVariantForReportType(report)
}

export function useUnifiedReportDateOrDateRange(): UnifiedReportDateQueryParams {
  const store = useContext(UnifiedReportStoreContext)
  const { date: effectiveDate } = useGlobalDate()
  const dateRange = useGlobalDateRange({ displayMode: 'dayRangePicker' })

  const report = useStore(store, state => state.route.report)
  const dateVariant = getDateVariantForReportType(report)

  switch (dateVariant) {
    case UnifiedReportDateVariant.Date:
      return { effectiveDate }
    case UnifiedReportDateVariant.DateRange:
      return dateRange
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
      route: { report: ReportEnum.CashflowStatement },
    })),
  )

  return (
    <UnifiedReportStoreContext.Provider value={store}>
      {props.children}
    </UnifiedReportStoreContext.Provider>
  )
}
