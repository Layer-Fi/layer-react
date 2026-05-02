import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useReportConfig } from '@hooks/api/businesses/[business-id]/reports/config/useReportConfig'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { ReportComboBoxOption } from '@components/ReportsNavigation/reportComboBoxOption'

export function ReportsMobileSelectionDrawer() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useReportConfig()
  const { baseReport, setBaseReport } = useBaseUnifiedReport()

  const groups = useMemo(() => {
    if (!data) return []

    return data.map(group => ({
      label: group.displayName,
      options: group.reports.map(report => new ReportComboBoxOption(report)),
    }))
  }, [data])

  const selectedValue = useMemo(() => {
    if (!baseReport) return null

    for (const group of groups) {
      const match = group.options.find(option => option.value === baseReport.key)
      if (match) return match
    }

    return null
  }, [baseReport, groups])

  const onSelectedValueChange = useCallback((value: ReportComboBoxOption | null) => {
    if (value) setBaseReport(value.original)
  }, [setBaseReport])

  return (
    <MobileSelectionDrawerWithTrigger<ReportComboBoxOption>
      ariaLabel={t('reports:label.reports_navigation', 'Reports navigation')}
      heading={t('reports:label.select_report', 'Select report')}
      groups={groups}
      selectedValue={selectedValue}
      onSelectedValueChange={onSelectedValueChange}
      isLoading={isLoading}
      isError={isError}
      isSearchable
      searchPlaceholder={t('reports:action.search_reports', 'Search reports')}
      slotProps={{
        Trigger: {
          label: t('reports:label.select_report', 'Select report'),
        },
      }}
    />
  )
}
