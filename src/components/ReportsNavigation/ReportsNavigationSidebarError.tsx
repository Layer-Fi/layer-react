import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@components/DataState/DataState'

export const ReportsNavigationSidebarError = () => {
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
