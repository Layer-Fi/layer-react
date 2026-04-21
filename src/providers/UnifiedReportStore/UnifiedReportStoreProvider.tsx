import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'
import { createStore, type StoreApi, useStore } from 'zustand'

import { type ReportConfig, ReportControl, type ReportGroup, type ReportType } from '@schemas/reports/reportConfig'
import { DateGroupBy, type DateQueryParams, type DateRangeQueryParams } from '@schemas/reports/unifiedReport'
import { unsafeAssertUnreachable } from '@utils/switch/assertUnreachable'
import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { type DateSelectionMode, useGlobalDate, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'

type UnifiedReportStoreActions = {
  setReport: (report: ReportConfig) => void
  setGroupBy: (groupBy: DateGroupBy | null) => void
}

type UnifiedReportStoreShape = {
  report: ReportConfig | null
  groupBy: DateGroupBy | null
  actions: UnifiedReportStoreActions
}

export enum UnifiedReportDateVariant {
  Date = 'Date',
  DateRange = 'DateRange',
}

const getDateVariant = (report: ReportConfig): UnifiedReportDateVariant =>
  report.controls.includes(ReportControl.DateRange)
    ? UnifiedReportDateVariant.DateRange
    : UnifiedReportDateVariant.Date

const hasGroupByControl = (report: ReportConfig): boolean =>
  report.controls.includes(ReportControl.GroupBy)

export type UnifiedReportParams = {
  report: ReportType
  groupBy: DateGroupBy | null
} & (DateQueryParams | DateRangeQueryParams)

const UnifiedReportStoreContext = createContext(
  createStore<UnifiedReportStoreShape>(() => ({
    report: null,
    groupBy: DateGroupBy.AllTime,
    actions: {
      setReport: () => {},
      setGroupBy: () => {},
    },
  })),
)

export function useActiveUnifiedReport() {
  const store = useContext(UnifiedReportStoreContext)
  const report = useStore(store, state => state.report)
  const setReport = useStore(store, state => state.actions.setReport)
  return useMemo(() => ({ report, setReport }), [report, setReport])
}

export function useUnifiedReportDateVariant(): UnifiedReportDateVariant | null {
  const { report } = useActiveUnifiedReport()
  return report ? getDateVariant(report) : null
}

export function useUnifiedReportGroupByParam() {
  const { report } = useActiveUnifiedReport()
  const store = useContext(UnifiedReportStoreContext)
  const groupBy = useStore(store, state => state.groupBy)
  const setGroupBy = useStore(store, state => state.actions.setGroupBy)

  const groupByState = useMemo(() => ({ groupBy, setGroupBy }), [groupBy, setGroupBy])

  if (report && hasGroupByControl(report)) {
    return groupByState
  }

  return null
}

export function useUnifiedReportDateParams({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }): DateQueryParams | DateRangeQueryParams | null {
  const dateVariant = useUnifiedReportDateVariant()
  const { date: effectiveDate } = useGlobalDate({ dateSelectionMode })
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode })

  if (dateVariant === null) return null

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

export function useUnifiedReportParams({ dateSelectionMode }: { dateSelectionMode: DateSelectionMode }): UnifiedReportParams | null {
  const { report } = useActiveUnifiedReport()
  const groupByParam = useUnifiedReportGroupByParam()
  const dateParams = useUnifiedReportDateParams({ dateSelectionMode })

  if (!report || !dateParams) return null

  return { report: report.reportType, groupBy: groupByParam?.groupBy ?? null, ...dateParams } as UnifiedReportParams
}

const findFirstLeaf = (groups: ReadonlyArray<ReportGroup>): ReportConfig | null => {
  for (const group of groups) {
    if (group.reports.length > 0) {
      return group.reports[0]
    }
  }
  return null
}

const hasLeafWithKey = (groups: ReadonlyArray<ReportGroup>, key: string): boolean =>
  groups.some(group => group.reports.some(report => report.key === key))

const createUnifiedReportStore = () =>
  createStore<UnifiedReportStoreShape>(set => ({
    report: null,
    groupBy: DateGroupBy.AllTime,
    actions: {
      setReport: (report: ReportConfig) => set({ report }),
      setGroupBy: (groupBy: DateGroupBy | null) => set({ groupBy }),
    },
  }))

function useHydrateUnifiedReportStore(store: StoreApi<UnifiedReportStoreShape>) {
  const { data } = useReportConfig()
  const { report, setReport } = useActiveUnifiedReport()

  useEffect(() => {
    if (!data) return
    if (report && hasLeafWithKey(data, report.key)) return

    const firstLeaf = findFirstLeaf(data)
    if (firstLeaf) setReport(firstLeaf)
  }, [report, data, store, setReport])
}

export function UnifiedReportStoreProvider({ children }: PropsWithChildren) {
  const [store] = useState(createUnifiedReportStore)
  useHydrateUnifiedReportStore(store)

  return (
    <UnifiedReportStoreContext.Provider value={store}>
      {children}
    </UnifiedReportStoreContext.Provider>
  )
}
