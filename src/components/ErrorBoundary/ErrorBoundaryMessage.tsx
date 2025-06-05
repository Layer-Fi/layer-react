import { DataState, DataStateStatus } from '../DataState'

export const ErrorBoundaryMessage = () => {
  return (
    <div className='Layer__component Layer__component-container Layer__error-boundary'>
      <DataState
        status={DataStateStatus.failed}
        title='Something went wrong'
        description='Try to refresh the page.'
      />
    </div>
  )
}
