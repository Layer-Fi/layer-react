import { type ReportControl } from '@schemas/features/unifiedReports/reportConfig'
import {
  type DateGroupBy,
  type DateQueryParams,
  type DateRangeQueryParams,
  type UnifiedReportReportingBasis,
} from '@schemas/features/unifiedReports/unifiedReport'
import type { QueryParams } from '@utils/shared/request/toDefinedSearchParameters'

// The request-shape contract for unified reports, kept out of the store so the
// endpoint hooks can type their params without reading app state.

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
