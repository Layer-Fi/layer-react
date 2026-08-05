import { type UnifiedReport } from '@schemas/features/unifiedReports/unifiedReport'

import {
  emptyReport,
  unifiedReportGenerators,
} from '@msw/api/businesses/[business-id]/reports/unified/generators/registry'

/** Keyed by report route, e.g. `profit-and-loss` or `tax/schedule-c/lines`. */
export type UnifiedReportOverrides = Partial<Record<string, UnifiedReport>>

const ROUTE_PREFIX = '/reports/unified/'

// The report name is the rest of the path, so it can span segments
// (`profit-and-loss/lines`) and is matched by a wildcard rather than a path param.
export const extractReportRoute = (url: string, suffix = ''): string => {
  const { pathname } = new URL(url)
  const route = decodeURIComponent(pathname.slice(pathname.indexOf(ROUTE_PREFIX) + ROUTE_PREFIX.length))

  return suffix && route.endsWith(suffix) ? route.slice(0, -suffix.length) : route
}

/*
 * Shared by the report endpoint and its excel export so a download is always
 * built from the same route, params, and override as the table it came from.
 */
export const resolveUnifiedReport = (
  route: string,
  params: URLSearchParams,
  override?: UnifiedReportOverrides,
): UnifiedReport =>
  override?.[route] ?? (unifiedReportGenerators[route]?.(params) ?? emptyReport())
