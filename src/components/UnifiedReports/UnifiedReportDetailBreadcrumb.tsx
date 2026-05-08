import { useCallback, useMemo } from 'react'

import type { ReportConfig } from '@schemas/reports/reportConfig'
import { useDetailUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { Breadcrumb, Breadcrumbs } from '@ui/Breadcrumbs/Breadcrumbs'

type BreadcrumbKey = string | number
const EMPTY_ARRAY: ReportConfig[] = []

export const UnifiedReportDetailBreadcrumb = () => {
  const { detailReportConfig, openDetailReport } = useDetailUnifiedReport()
  const breadcrumb = detailReportConfig?.breadcrumb

  const breadcrumbItems = useMemo(() => breadcrumb ?? EMPTY_ARRAY, [breadcrumb])

  const handleBreadcrumbClick = useCallback((key: BreadcrumbKey) => {
    const index = breadcrumbItems.findIndex(item => item.key === key)
    if (index === -1 || !detailReportConfig) return

    openDetailReport({
      report: breadcrumbItems[index],
      breadcrumb: breadcrumbItems.slice(0, index + 1),
      column: detailReportConfig?.column,
    })
  }, [breadcrumbItems, detailReportConfig, openDetailReport])

  return (
    <Breadcrumbs items={breadcrumbItems} onAction={handleBreadcrumbClick}>
      {item => <Breadcrumb id={item.key}>{item.displayName}</Breadcrumb>}
    </Breadcrumbs>
  )
}
