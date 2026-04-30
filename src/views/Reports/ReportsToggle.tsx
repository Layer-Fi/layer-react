import { useTranslation } from 'react-i18next'

import { type ReportType, useReportsHeaderContext } from '@contexts/ReportsHeaderContext/ReportsHeaderContext'
import { Toggle } from '@ui/Toggle/Toggle'

export const ReportsToggle = () => {
  const { t } = useTranslation()
  const context = useReportsHeaderContext()

  if (!context) return null

  const {
    enabledReports,
    options,
    activeReport,
    setActiveReport,
  } = context

  if (enabledReports.length <= 1) return null

  return (
    <div className='Layer__component Layer__header__actions'>
      <Toggle
        ariaLabel={t('reports:label.report_type', 'Report type')}
        options={options}
        selectedKey={activeReport}
        onSelectionChange={key => setActiveReport(key as ReportType)}
      />
    </div>
  )
}
