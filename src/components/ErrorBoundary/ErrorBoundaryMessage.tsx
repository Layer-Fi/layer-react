import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@components/DataState/DataState'

export const ErrorBoundaryMessage = () => {
  const { t } = useTranslation()
  return (
    <div className='Layer__component Layer__component-container Layer__error-boundary'>
      <DataState
        status={DataStateStatus.failed}
        title={t('somethingWentWrong', 'Something went wrong')}
        description={t('tryToRefreshThePage', 'Try to refresh the page.')}
      />
    </div>
  )
}
