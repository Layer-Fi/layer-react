import classNames from 'classnames'
import { useTranslation } from 'react-i18next'

import { COMPONENT_CONTAINER_CLASS_NAME, COMPONENT_ROOT_CLASS_NAME } from '@utils/shared/styles/componentClassNames'
import { DataState, DataStateStatus } from '@ui/DataState/DataState'

import './errorBoundaryMessage.scss'
export const ErrorBoundaryMessage = () => {
  const { t } = useTranslation()
  return (
    <div className={classNames(COMPONENT_ROOT_CLASS_NAME, COMPONENT_CONTAINER_CLASS_NAME, 'Layer__ErrorBoundaryMessage')}>
      <DataState
        status={DataStateStatus.failed}
        title={t('common:error.something_went_wrong', 'Something went wrong')}
        description={t('common:error.try_to_refresh_page', 'Try to refresh the page.')}
      />
    </div>
  )
}
