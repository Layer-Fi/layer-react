import { useEffect } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { DataModel } from '../../types/general'
import { TaskTypes } from '../../types/tasks'
import useSWR from 'swr'

type UseTasks = () => {
  data?: TaskTypes[]
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  refetch: () => void
  submitResponseToTask: (taskId: string, userResponse: string) => void
}

export const useTasks: UseTasks = () => {
  const { auth, businessId, apiUrl, read, syncTimestamps, hasBeenTouched } =
    useLayerContext()

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId && auth?.access_token && `tasks-${businessId}`,
    Layer.getTasks(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const refetch = () => mutate()

  const submitResponseToTask = (taskId: string, userResponse: string) => {
    if (!taskId || !userResponse || userResponse.length === 0) return

    const data = {
      type: 'FreeResponse',
      user_response: userResponse,
    }

    Layer.submitResponseToTask(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
      body: data,
    }).then(() => refetch())
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (isLoading || isValidating) {
      read(DataModel.TASKS)
    }
  }, [isLoading, isValidating])

  useEffect(() => {
    if (hasBeenTouched(DataModel.TASKS)) {
      refetch()
    }
  }, [syncTimestamps])

  return {
    data: data?.data,
    isLoading,
    isValidating,
    error,
    refetch,
    submitResponseToTask,
  }
}
