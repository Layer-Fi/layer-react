import { useMemo } from 'react'
import { DataState, DataStateStatus } from '@components/DataState/DataState'

type ManageUploadTableEmptyStatesProps = {
  hasVisibleUploads: boolean
  isError: boolean
  isLoadingWithoutData: boolean
}

export function ManageUploadTableEmptyStates({
  hasVisibleUploads,
  isError,
  isLoadingWithoutData,
}: ManageUploadTableEmptyStatesProps) {
  const StateComponent = useMemo(() => {
    if (isError) {
      return (
        <DataState
          status={DataStateStatus.failed}
          title='Something went wrong'
          description='We couldn’t load your Uploads'
        />
      )
    }

    if (isLoadingWithoutData) {
      return null
    }

    if (!hasVisibleUploads) {
      return (
        <DataState
          status={DataStateStatus.allDone}
          title={'You have no Uploads'}
          description={'All Uploads will be displayed here once uploaded'}
        />
      )
    }

    if (!hasVisibleUploads) {
      return (
        <DataState
          status={DataStateStatus.info}
          title='No Uploads found'
          description='Try adding some uploads'
        />
      )
    }

    return null
  }, [isError, isLoadingWithoutData, hasVisibleUploads])

  if (StateComponent === null) {
    return null
  }

  return (
    <div className='Layer__table-state-container'>
      {StateComponent}
    </div>
  )
}
