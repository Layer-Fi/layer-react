import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@ui/DataState/DataState'

import './errorBoundaryMessage.scss'

export const ErrorBoundaryMessage = () => {
  const { t } = useTranslation()
  return (
    <div className='Layer__component Layer__component-container Layer__ErrorBoundaryMessage'>
      <DataState
        status={DataStateStatus.failed}
        title={t('common:error.something_went_wrong', 'Something went wrong')}
        description={t('common:error.try_to_refresh_page', 'Try to refresh the page.')}
      />
    </div>
  )
}
