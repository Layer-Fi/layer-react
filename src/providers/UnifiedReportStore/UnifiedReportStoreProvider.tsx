import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { createStore, type StoreApi, useStore } from 'zustand'

import { type ReportConfig, ReportControl, type ReportGroup } from '@schemas/reports/reportConfig'
import { DateGroupBy, type DateQueryParams, type DateRangeQueryParams, type UnifiedReportColumn } from '@schemas/reports/unifiedReport'
import type { QueryParams } from '@utils/request/toDefinedSearchParameters'
import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { type DateSelectionMode, useGlobalDate, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

type DetailReportConfig = {
  report: ReportConfig
  breadcrumb: ReportConfig[]
  column: UnifiedReportColumn
}

type UnifiedReportStoreActions = {
  setBaseReport: (report: ReportConfig) => void
  openDetailReport: (params: DetailReportConfig) => void
  closeDetailReport: () => void
  setGroupBy: (groupBy: DateGroupBy | null) => void
}

type UnifiedReportStoreShape = {
  baseReport: ReportConfig | null
  detailReportConfig: DetailReportConfig | null
  groupBy: DateGroupBy | null
  dateSelectionMode: DateSelectionMode
  actions: UnifiedReportStoreActions
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
    baseReport: null,
    detailReportConfig: null,
    groupBy: DateGroupBy.AllTime,
    dateSelectionMode: 'full',
    actions: {
      setBaseReport: () => {},
      openDetailReport: () => {},
      closeDetailReport: () => {},
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

  const baseReport = useStore(store, state => state.baseReport)
  const detailReportConfig = useStore(store, state => state.detailReportConfig)

  return useMemo(() => ({
    report: detailReportConfig?.report ?? baseReport,
    isDetailView: detailReportConfig != null,
  }), [baseReport, detailReportConfig])
}

export function useBaseUnifiedReport() {
  const store = useContext(UnifiedReportStoreContext)

  const baseReport = useStore(store, state => state.baseReport)
  const setBaseReport = useStore(store, state => state.actions.setBaseReport)

  return useMemo(() => ({ baseReport, setBaseReport }), [baseReport, setBaseReport])
}

export function useDetailUnifiedReport() {
  const store = useContext(UnifiedReportStoreContext)

  const detailReportConfig = useStore(store, state => state.detailReportConfig)
  const openDetailReport = useStore(store, state => state.actions.openDetailReport)
  const closeDetailReport = useStore(store, state => state.actions.closeDetailReport)

  return useMemo(() => ({
    detailReportConfig,
    isDetailView: detailReportConfig != null,
    openDetailReport,
    closeDetailReport,
  }), [detailReportConfig, openDetailReport, closeDetailReport])
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
  let firstReport: ReportConfig | null = null
  for (const group of groups) {
    for (const report of group.reports) {
      if (report.isDefaultReport) return report
      if (!firstReport) firstReport = report
    }
  }
  return firstReport
}

const hasReportWithKey = (groups: ReadonlyArray<ReportGroup>, key: string): boolean =>
  groups.some(group => group.reports.some(report => report.key === key))

const createUnifiedReportStore = (dateSelectionMode: DateSelectionMode) =>
  createStore<UnifiedReportStoreShape>(set => ({
    baseReport: null,
    detailReportConfig: null,
    groupBy: DateGroupBy.AllTime,
    dateSelectionMode,
    actions: {
      setBaseReport: (baseReport: ReportConfig) =>
        set({ baseReport, detailReportConfig: null }),
      openDetailReport: (detailReportConfig: DetailReportConfig) => set({ detailReportConfig }),
      closeDetailReport: () => set({ detailReportConfig: null }),
      setGroupBy: (groupBy: DateGroupBy | null) => set({ groupBy }),
    },
  }))

function useHydrateUnifiedReportStore(store: StoreApi<UnifiedReportStoreShape>) {
  const { data } = useReportConfig()
  const baseReport = useStore(store, state => state.baseReport)
  const setBaseReport = useStore(store, state => state.actions.setBaseReport)

  useEffect(() => {
    if (!data) return
    if (baseReport && hasReportWithKey(data, baseReport.key)) return

    const defaultReport = findDefaultReport(data)
    if (defaultReport) setBaseReport(defaultReport)
  }, [data, baseReport, setBaseReport])
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
