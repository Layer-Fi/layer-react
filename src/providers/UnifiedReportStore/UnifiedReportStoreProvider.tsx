import { useState, createContext, useContext, useMemo, type PropsWithChildren } from 'react'
import { createStore, useStore } from 'zustand'
import { ReportEnum, type DateQueryParams, type DateRangeQueryParams } from '../../schemas/reports/unifiedReport'
import { unsafeAssertUnreachable } from '../../utils/switch/assertUnreachable'
import { useGlobalDate, useGlobalDateRange } from '../GlobalDateStore/GlobalDateStoreProvider'
import { ReportingBasis } from '../../schemas/common/reportingBasis'
import type { Tag } from '../../features/tags/tagSchemas'

type UnifiedReportStoreShape = {
  report: ReportEnum
  reportingBasis: ReportingBasis | null
  tags: readonly Tag[]
  actions: {
    setReportingBasis: (reportingBasis: ReportingBasis | null) => void
    setTags: (tags: readonly Tag[]) => void
  }
}

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

export type UnifiedReportWithFilters =
  | {
    report: ReportEnum.BalanceSheet
    reportingBasis: ReportingBasis | null
    tagKey: string | null
    tagValues: readonly string[] | null
  } & DateQueryParams
  | {
    report: ReportEnum.CashflowStatement
    reportingBasis: ReportingBasis | null
    tagKey: string | null
    tagValues: readonly string[] | null
  } & DateRangeQueryParams

const UnifiedReportStoreContext = createContext(
  createStore<UnifiedReportStoreShape>(() => ({
    report: ReportEnum.CashflowStatement,
    reportingBasis: ReportingBasis.Accrual,
    tags: [],
    actions: {
      setReportingBasis: () => {},
      setTags: () => {},
    },
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
  const { startDate, endDate } = useGlobalDateRange({ displayMode: 'dayRangePicker' })

  const report = useStore(store, state => state.report)
  const dateVariant = reportToDateVariantMap[report]

  return useMemo(() => {
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
  }, [dateVariant, report, effectiveDate, startDate, endDate])
}

export function useUnifiedReportWithFilters(): UnifiedReportWithFilters {
  const store = useContext(UnifiedReportStoreContext)
  const { date: effectiveDate } = useGlobalDate()
  const { startDate, endDate } = useGlobalDateRange({ displayMode: 'dayRangePicker' })

  const report = useStore(store, state => state.report)
  const reportingBasis = useStore(store, state => state.reportingBasis)
  const tags = useStore(store, state => state.tags)
  const dateVariant = reportToDateVariantMap[report]

  return useMemo(() => {
    // Extract tagKey and tagValues from tags array
    // Assuming all tags have the same key (dimension)
    const tagKey = tags.length > 0 ? tags[0].key : null
    const tagValues = tags.length > 0 ? tags.map(tag => tag.value) : null

    const baseFilters = { report, reportingBasis, tagKey, tagValues }

    switch (dateVariant) {
      case UnifiedReportDateVariant.Date:
        return { ...baseFilters, effectiveDate } as UnifiedReportWithFilters
      case UnifiedReportDateVariant.DateRange:
        return { ...baseFilters, startDate, endDate } as UnifiedReportWithFilters
      default:
        unsafeAssertUnreachable({
          value: dateVariant,
          message: 'Unexpected date variant',
        })
    }
  }, [dateVariant, report, effectiveDate, startDate, endDate, reportingBasis, tags])
}

export function useUnifiedReportReportingBasis() {
  const store = useContext(UnifiedReportStoreContext)
  const reportingBasis = useStore(store, state => state.reportingBasis)
  const setReportingBasis = useStore(store, state => state.actions.setReportingBasis)

  return useMemo(
    () => ({ reportingBasis, setReportingBasis }),
    [reportingBasis, setReportingBasis],
  )
}

export function useUnifiedReportTags() {
  const store = useContext(UnifiedReportStoreContext)
  const tags = useStore(store, state => state.tags)
  const setTags = useStore(store, state => state.actions.setTags)

  return useMemo(
    () => ({ tags, setTags }),
    [tags, setTags],
  )
}

export function UnifiedReportStoreProvider(props: PropsWithChildren) {
  const [store] = useState(() =>
    createStore<UnifiedReportStoreShape>(set => ({
      report: ReportEnum.CashflowStatement,
      reportingBasis: ReportingBasis.Accrual,
      tags: [],
      actions: {
        setReportingBasis: reportingBasis =>
          set(() => ({ reportingBasis })),
        setTags: tags =>
          set(() => ({ tags })),
      },
    })),
  )

  return (
    <UnifiedReportStoreContext.Provider value={store}>
      {props.children}
    </UnifiedReportStoreContext.Provider>
  )
}
