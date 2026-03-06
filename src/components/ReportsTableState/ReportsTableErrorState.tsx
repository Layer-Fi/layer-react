import { DataState, DataStateStatus } from '@components/DataState/DataState'

type ReportsTableErrorStateProps = {
  isLoading?: boolean
}

export const ReportsTableErrorState = ({
  isLoading,
}: ReportsTableErrorStateProps) => {
  return (
    <div className='Layer__table-state-container'>
      <DataState
        status={DataStateStatus.failed}
        title='Something went wrong'
        description='We couldn&apos;t load your data.'
        isLoading={isLoading}
      />
    </div>
  )
}
