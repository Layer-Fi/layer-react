import { useState, createContext, useContext, type PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'
import { ReportEnum, type UnifiedReportDateQueryParams } from '../../schemas/reports/unifiedReport'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { useGlobalDate, useGlobalDateRange } from '../GlobalDateStore/GlobalDateStoreProvider'

type UnifiedReportRouteState = { report: ReportEnum }
type UnifiedReportRouteStoreShape = {
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

const UnifiedReportRouteStoreContext = createContext(
  createStore<UnifiedReportRouteStoreShape>(() => ({
    route: { report: ReportEnum.CashflowStatement },
  })),
)

export function useUnifiedReportRoute() {
  const store = useContext(UnifiedReportRouteStoreContext)
  return useStore(store, state => state.route)
}

export function useUnifiedReportDateVariant(): UnifiedReportDateVariant {
  const store = useContext(UnifiedReportRouteStoreContext)

  const report = useStore(store, state => state.route.report)
  return getDateVariantForReportType(report)
}

export function useUnifiedReportDateOrDateRange(): UnifiedReportDateQueryParams {
  const store = useContext(UnifiedReportRouteStoreContext)
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

export function UnifiedReportRouteStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<UnifiedReportRouteStoreShape>(() => ({
      route: { report: ReportEnum.CashflowStatement },
    })),
  )

  return (
    <UnifiedReportRouteStoreContext.Provider value={store}>
      {props.children}
    </UnifiedReportRouteStoreContext.Provider>
  )
}
