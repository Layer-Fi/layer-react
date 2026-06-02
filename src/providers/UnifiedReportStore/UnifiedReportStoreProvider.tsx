import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { getYear } from 'date-fns'
import { createStore, type StoreApi, useStore } from 'zustand'

import {
  type ReportConfig,
  ReportControl,
  type ReportGroup,
} from '@schemas/reports/reportConfig'
import {
  DateGroupBy,
  type DateQueryParams,
  type DateRangeQueryParams,
  isUnifiedReportReportingBasis,
  type UnifiedReportColumn,
  type UnifiedReportReportingBasis,
} from '@schemas/reports/unifiedReport'
import { isActiveTagValueDefinition, type TagValueDefinition } from '@schemas/tag'
import type { QueryParams } from '@utils/request/toDefinedSearchParameters'
import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { type DateSelectionMode, useGlobalDate, useGlobalDateRange } from '@providers/GlobalDateStore/GlobalDateStoreProvider'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'

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
  setReportingBasis: (reportingBasis: UnifiedReportReportingBasis | null) => void
  setSelectedTagValues: (selectedTagValues: ReadonlyArray<TagValueDefinition>) => void
}

type UnifiedReportStoreShape = {
  baseReport: ReportConfig | null
  detailReportConfig: DetailReportConfig | null
  groupBy: DateGroupBy | null
  reportingBasis: UnifiedReportReportingBasis | null
  selectedTagValues: ReadonlyArray<TagValueDefinition>
  dateSelectionMode: DateSelectionMode
  actions: UnifiedReportStoreActions
}

export const hasControl = (report: ReportConfig | null, control: ReportControl): boolean =>
  report?.controls.includes(control) ?? false

export type ReportControlParams = {
  [ReportControl.Date]: DateQueryParams
  [ReportControl.DateRange]: DateRangeQueryParams
  [ReportControl.GroupBy]: { groupBy: DateGroupBy }
  [ReportControl.ReportingBasis]: { reportingBasis: UnifiedReportReportingBasis }
  [ReportControl.Year]: { year: number }
}

export type UnifiedReportTagFilterParams = {
  tagFilters: string
}

export type UnifiedReportControlParams = Partial<
  & ReportControlParams[ReportControl.Date]
  & ReportControlParams[ReportControl.DateRange]
  & ReportControlParams[ReportControl.GroupBy]
  & ReportControlParams[ReportControl.ReportingBasis]
  & ReportControlParams[ReportControl.Year]
  & UnifiedReportTagFilterParams
>

export type UnifiedReportParams = {
  route: string
} & UnifiedReportControlParams & QueryParams

const UnifiedReportStoreContext = createContext(
  createStore<UnifiedReportStoreShape>(() => ({
    baseReport: null,
    detailReportConfig: null,
    groupBy: DateGroupBy.AllTime,
    reportingBasis: null,
    selectedTagValues: [],
    dateSelectionMode: 'full',
    actions: {
      setBaseReport: () => {},
      openDetailReport: () => {},
      closeDetailReport: () => {},
      setGroupBy: () => {},
      setReportingBasis: () => {},
      setSelectedTagValues: () => {},
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
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.UnifiedReports)

  const baseReport = useStore(store, state => state.baseReport)
  const setBaseReport = useStore(store, state => state.actions.setBaseReport)

  // Wraps the store action so every user-driven report switch (sidebar, mega
  // menu, mobile drawer) emits a single event. Programmatic hydration of the
  // default report calls the store action directly and is intentionally silent.
  const setBaseReportWithEvent = useCallback((report: ReportConfig) => {
    emitLayerEvent({
      type: LayerEventType.ReportsTabClicked,
      version: 1,
      payload: { reportKey: report.key },
    })
    setBaseReport(report)
  }, [emitLayerEvent, setBaseReport])

  return useMemo(
    () => ({ baseReport, setBaseReport: setBaseReportWithEvent }),
    [baseReport, setBaseReportWithEvent],
  )
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

// This variant exists so that the UnifiedReportCell does not depend on the detail report config.
export function useOpenDetailReport() {
  const store = useContext(UnifiedReportStoreContext)
  return useStore(store, state => state.actions.openDetailReport)
}

export function useUnifiedReportGroupByParam() {
  const store = useContext(UnifiedReportStoreContext)

  const groupBy = useStore(store, state => state.groupBy)
  const setGroupBy = useStore(store, state => state.actions.setGroupBy)

  return useMemo(() => ({ groupBy, setGroupBy }), [groupBy, setGroupBy])
}

export function useUnifiedReportReportingBasisParam() {
  const store = useContext(UnifiedReportStoreContext)

  const reportingBasis = useStore(store, state => state.reportingBasis)
  const setReportingBasis = useStore(store, state => state.actions.setReportingBasis)

  return useMemo(() => ({ reportingBasis, setReportingBasis }), [reportingBasis, setReportingBasis])
}

export function useUnifiedReportTagSelection() {
  const store = useContext(UnifiedReportStoreContext)

  const selectedTagValues = useStore(store, state => state.selectedTagValues)
  const setSelectedTagValues = useStore(store, state => state.actions.setSelectedTagValues)

  return useMemo(() => ({ selectedTagValues, setSelectedTagValues }), [selectedTagValues, setSelectedTagValues])
}

const buildUnifiedReportTagFilters = (
  report: ReportConfig,
  selectedTagValues: ReadonlyArray<TagValueDefinition>,
): string | undefined => {
  const key = report.tagControl?.tagDimension.key.trim()
  if (!key) return

  const values = selectedTagValues
    .filter(isActiveTagValueDefinition)
    .map(tagValue => tagValue.value)
    .filter(value => value.trim().length > 0)

  if (values.length === 0) return

  return JSON.stringify(values.map(value => ({ key, values: [value] })))
}

const REPORTING_BASIS_QUERY_PARAMETER = 'reporting_basis'

const getInitialReportingBasis = (report: ReportConfig): UnifiedReportReportingBasis | null => {
  const value = report.baseQueryParameters[REPORTING_BASIS_QUERY_PARAMETER]
  return isUnifiedReportReportingBasis(value) ? value : null
}

const getBaseQueryParameters = (
  report: ReportConfig,
  hasReportingBasisControl: boolean,
): QueryParams => {
  if (!hasReportingBasisControl) return report.baseQueryParameters

  return Object.fromEntries(
    Object.entries(report.baseQueryParameters)
      .filter(([key]) => key !== REPORTING_BASIS_QUERY_PARAMETER),
  )
}

export function useUnifiedReportParams(): UnifiedReportParams | null {
  const { report } = useActiveUnifiedReport()
  const store = useContext(UnifiedReportStoreContext)
  const groupBy = useStore(store, state => state.groupBy)
  const reportingBasis = useStore(store, state => state.reportingBasis)
  const selectedTagValues = useStore(store, state => state.selectedTagValues)
  const dateSelectionMode = useUnifiedReportDateSelectionMode()
  const { date: effectiveDate } = useGlobalDate({ dateSelectionMode })
  const { startDate, endDate } = useGlobalDateRange({ dateSelectionMode })
  const { startDate: yearStartDate } = useGlobalDateRange({ dateSelectionMode: 'year' })

  return useMemo(() => {
    if (!report) return null

    const tagFilters = buildUnifiedReportTagFilters(report, selectedTagValues)
    const hasReportingBasisControl = hasControl(report, ReportControl.ReportingBasis)
    const baseQueryParameters = getBaseQueryParameters(report, hasReportingBasisControl)

    return {
      route: report.reportRoute,
      ...baseQueryParameters,
      ...(hasControl(report, ReportControl.Date) && { effectiveDate }),
      ...(hasControl(report, ReportControl.DateRange) && { startDate, endDate }),
      ...(hasControl(report, ReportControl.GroupBy) && groupBy != null && { groupBy }),
      ...(hasReportingBasisControl && reportingBasis != null && { reportingBasis }),
      ...(hasControl(report, ReportControl.Year) && { year: getYear(yearStartDate) }),
      ...(tagFilters && { tagFilters }),
    }
  }, [effectiveDate, endDate, groupBy, report, reportingBasis, selectedTagValues, startDate, yearStartDate])
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
    reportingBasis: null,
    selectedTagValues: [],
    dateSelectionMode,
    actions: {
      setBaseReport: (baseReport: ReportConfig) =>
        set({
          baseReport,
          detailReportConfig: null,
          reportingBasis: getInitialReportingBasis(baseReport),
          selectedTagValues: baseReport.tagControl?.initialSelectedTags.filter(isActiveTagValueDefinition) ?? [],
        }),
      openDetailReport: (detailReportConfig: DetailReportConfig) => set({ detailReportConfig }),
      closeDetailReport: () => set({ detailReportConfig: null }),
      setGroupBy: (groupBy: DateGroupBy | null) => set({ groupBy }),
      setReportingBasis: (reportingBasis: UnifiedReportReportingBasis | null) => set({ reportingBasis }),
      setSelectedTagValues: (selectedTagValues: ReadonlyArray<TagValueDefinition>) =>
        set({ selectedTagValues: selectedTagValues.filter(isActiveTagValueDefinition) }),
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
