import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@ui/DataState/DataState'

export const UnifiedReportsNavigationSidebarError = () => {
  const { t } = useTranslation()
  return (
    <DataState
      status={DataStateStatus.failed}
      title={t('reports:error.couldnt_load_reports', 'Failed to load reports')}
      description={t('reports:error.load_reports_navigation', 'Something went wrong while loading this navigation. Please try again.')}
      spacing
    />
  )
}
