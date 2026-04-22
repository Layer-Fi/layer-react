import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { createStore, type StoreApi, useStore } from 'zustand'

import { type ReportConfig, ReportControl, type ReportGroup } from '@schemas/reports/reportConfig'
import { DateGroupBy, type DateQueryParams, type DateRangeQueryParams } from '@schemas/reports/unifiedReport'
import type { QueryParams } from '@utils/request/toDefinedSearchParameters'
import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { type DateSelectionMode, useGlobalDate, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

type UnifiedReportStoreActions = {
  setReport: (report: ReportConfig) => void
  setGroupBy: (groupBy: DateGroupBy | null) => void
}

type UnifiedReportStoreShape = {
  report: ReportConfig | null
  groupBy: DateGroupBy | null
  dateSelectionMode: DateSelectionMode
  actions: UnifiedReportStoreActions
}

export enum UnifiedReportDateVariant {
  Date = 'Date',
  DateRange = 'DateRange',
}

export const hasControl = (report: ReportConfig | null, control: ReportControl): boolean =>
  report?.controls.includes(control) ?? false

export type ReportControlParams = {
  [ReportControl.Date]: DateQueryParams
  [ReportControl.DateRange]: DateRangeQueryParams
  [ReportControl.GroupBy]: { groupBy: DateGroupBy }
}

export type UnifiedReportControlParams = Partial<
  & ReportControlParams[ReportControl.Date]
  & ReportControlParams[ReportControl.DateRange]
  & ReportControlParams[ReportControl.GroupBy]
>

export type UnifiedReportParams = {
  route: string
} & UnifiedReportControlParams & QueryParams

const UnifiedReportStoreContext = createContext(
  createStore<UnifiedReportStoreShape>(() => ({
    report: null,
    groupBy: DateGroupBy.AllTime,
    dateSelectionMode: 'full',
    actions: {
      setReport: () => {},
      setGroupBy: () => {},
    },
  })),
)

export function useUnifiedReportDateSelectionMode() {
  const store = useContext(UnifiedReportStoreContext)
  return useStore(store, state => state.dateSelectionMode)
}

export function useActiveUnifiedReport() {
  const store = useContext(UnifiedReportStoreContext)

  const report = useStore(store, state => state.report)
  const setReport = useStore(store, state => state.actions.setReport)

  return useMemo(() => ({ report, setReport }), [report, setReport])
}

export function useUnifiedReportGroupByParam() {
  const store = useContext(UnifiedReportStoreContext)

  const groupBy = useStore(store, state => state.groupBy)
  const setGroupBy = useStore(store, state => state.actions.setGroupBy)

  return useMemo(() => ({ groupBy, setGroupBy }), [groupBy, setGroupBy])
}

export function useUnifiedReportParams(): UnifiedReportParams | null {
  const { report } = useActiveUnifiedReport()
  const store = useContext(UnifiedReportStoreContext)
  const groupBy = useStore(store, state => state.groupBy)
  const dateSelectionMode = useUnifiedReportDateSelectionMode()
  const { date: effectiveDate } = useGlobalDate({ dateSelectionMode })
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode })

  return useMemo(() => {
    if (!report) return null

    return {
      route: report.reportRoute,
      ...report.baseQueryParameters,
      ...(hasControl(report, ReportControl.Date) && { effectiveDate }),
      ...(hasControl(report, ReportControl.DateRange) && { startDate, endDate }),
      ...(hasControl(report, ReportControl.GroupBy) && groupBy != null && { groupBy }),
    }
  }, [effectiveDate, endDate, groupBy, report, startDate])
}

const findDefaultReport = (groups: ReadonlyArray<ReportGroup>): ReportConfig | null => {
  for (const group of groups) {
    for (const report of group.reports) {
      if (report.isDefaultReport) return report
    }
  }
  return null
}

const createUnifiedReportStore = (dateSelectionMode: DateSelectionMode) =>
  createStore<UnifiedReportStoreShape>(set => ({
    report: null,
    groupBy: DateGroupBy.AllTime,
    dateSelectionMode,
    actions: {
      setReport: (report: ReportConfig) => set({ report }),
      setGroupBy: (groupBy: DateGroupBy | null) => set({ groupBy }),
    },
  }))

function useHydrateUnifiedReportStore(store: StoreApi<UnifiedReportStoreShape>) {
  const { data } = useReportConfig()
  const setReport = useStore(store, state => state.actions.setReport)

  useEffect(() => {
    if (!data) return

    const defaultReport = findDefaultReport(data)
    if (defaultReport) setReport(defaultReport)
  }, [data, setReport])
}

function useSyncExternalDateSelectionMode(store: StoreApi<UnifiedReportStoreShape>, dateSelectionMode: DateSelectionMode) {
  useEffect(() => {
    store.setState({ dateSelectionMode })
  }, [store, dateSelectionMode])
}

type UnifiedReportStoreProviderProps = {
  dateSelectionMode?: DateSelectionMode
}

export function UnifiedReportStoreProvider({ children, dateSelectionMode = 'full' }: PropsWithChildren<UnifiedReportStoreProviderProps>) {
  const [store] = useState(() => createUnifiedReportStore(dateSelectionMode))
  useHydrateUnifiedReportStore(store)
  useSyncExternalDateSelectionMode(store, dateSelectionMode)

  return (
    <UnifiedReportStoreContext.Provider value={store}>
      {children}
    </UnifiedReportStoreContext.Provider>
  )
}
