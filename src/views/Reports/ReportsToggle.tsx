import { useTranslation } from 'react-i18next'

import { type ReportType, useReportsHeaderContext } from '@contexts/ReportsHeaderContext/ReportsHeaderContext'
import { HStack } from '@ui/Stack/Stack'
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
    <HStack className='Layer__component' gap='sm' align='center' justify='space-between'>
      <Toggle
        ariaLabel={t('reports:label.report_type', 'Report type')}
        options={options}
        selectedKey={activeReport}
        onSelectionChange={key => setActiveReport(key as ReportType)}
      />
    </HStack>
  )
}
