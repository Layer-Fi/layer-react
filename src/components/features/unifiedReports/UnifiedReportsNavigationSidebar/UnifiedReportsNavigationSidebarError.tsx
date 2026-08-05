import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@ui/DataState/DataState'

export const UnifiedReportsNavigationSidebarError = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('unifiedReports:UnifiedReportsNavigationSidebar.UnifiedReportsNavigationSidebarError.error.couldnt_load_reports', 'Failed to load reports')}
      description={t('unifiedReports:UnifiedReportsNavigationSidebar.UnifiedReportsNavigationSidebarError.error.load_reports_navigation', 'Something went wrong while loading this navigation. Please try again.')}
      spacing
    />
  )
}
