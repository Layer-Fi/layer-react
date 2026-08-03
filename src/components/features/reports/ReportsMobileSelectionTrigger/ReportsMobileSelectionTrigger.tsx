import { useTranslation } from 'react-i18next'

import { type ReportOption, useReportsHeaderContext } from '@contexts/ReportsHeaderContext/ReportsHeaderContext'
import { MobileSelectionDrawerWithTrigger } from '@ui/MobileSelectionDrawer/MobileSelectionDrawerWithTrigger'

export const ReportsMobileSelectionTrigger = () => {
  const { t } = useTranslation()
  const context = useReportsHeaderContext()

  if (!context) return null

  const { enabledReports, options, selectedReportOption, setActiveReport } = context

  if (enabledReports.length <= 1) return null

  return (
    <MobileSelectionDrawerWithTrigger<ReportOption>
      ariaLabel={t('reports:label.report_type', 'Report type')}
      heading={t('reports:label.select_report', 'Select report')}
      options={options}
      selectedValue={selectedReportOption}
      onSelectedValueChange={value => value && setActiveReport(value.value)}
    />
  )
}
