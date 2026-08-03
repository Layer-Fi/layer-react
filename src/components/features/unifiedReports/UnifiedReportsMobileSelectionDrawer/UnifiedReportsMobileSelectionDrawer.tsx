import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetReportConfig } from '@api/businesses/[business-id]/reports/config/get'
import { useBaseUnifiedReport } from '@providers/UnifiedReportStore/UnifiedReportStoreProvider'
import { HStack } from '@ui/Stack/Stack'
import { MobileSelectionDrawerWithTrigger } from '@blocks/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'
import { UnifiedReportComboBoxOption } from '@features/unifiedReports/UnifiedReportsMobileSelectionDrawer/unifiedReportComboBoxOption'

import './unifiedReportsMobileSelectionDrawer.scss'

export function UnifiedReportsMobileSelectionDrawer() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = useGetReportConfig()
  const { baseReport, setBaseReport } = useBaseUnifiedReport()

  const groups = useMemo(() => {
    if (!data) return []

    return data.map(group => ({
      label: group.displayName,
      options: group.reports.map(report => new UnifiedReportComboBoxOption(report)),
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

  const onSelectedValueChange = useCallback((value: UnifiedReportComboBoxOption | null) => {
    if (value) setBaseReport(value.original)
  }, [setBaseReport])

  return (
    <HStack className='Layer__UnifiedReportsMobileSelectionDrawer'>
      <MobileSelectionDrawerWithTrigger<UnifiedReportComboBoxOption>
        ariaLabel={t('reports:label.reports_navigation', 'Reports navigation')}
        heading={t('reports:label.select_report', 'Select report')}
        groups={groups}
        selectedValue={selectedValue}
        onSelectedValueChange={onSelectedValueChange}
        isLoading={isLoading}
        isError={isError}
        isSearchable
        searchPlaceholder={t('reports:action.search_reports', 'Search reports')}
      />
    </HStack>
  )
}
