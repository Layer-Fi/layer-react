import { useTranslation } from 'react-i18next'

import { DataState, DataStateStatus } from '@components/DataState/DataState'

type ReportsTableErrorStateProps = {
  isLoading?: boolean
}

export const ReportsTableErrorState = ({
  isLoading,
}: ReportsTableErrorStateProps) => {
  const { t } = useTranslation()
  return (
    <div className='Layer__table-state-container'>
      <DataState
        status={DataStateStatus.failed}
        title={t('common:error.something_went_wrong', 'Something went wrong')}
        description={t('common:error.couldnt_load_data', 'We couldn\'t load your data.')}
        isLoading={isLoading}
      />
    </div>
  )
}
