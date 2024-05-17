import { Layer } from '../../api/layer'
import { TaskTypes } from '../../types/tasks'
import { useLayerContext } from '../useLayerContext'
import useSWR from 'swr'

type UseTasks = () => {
  data?: TaskTypes[]
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  refetch: () => void
  update: (taskId: string, userResponse: string) => void
}

export const useTasks: UseTasks = () => {
  const { auth, businessId, apiUrl } = useLayerContext()

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    businessId && auth?.access_token && `tasks-${businessId}`,
    Layer.getTasks(apiUrl, auth?.access_token, {
      params: { businessId },
    }),
  )

  const refetch = () => mutate()

  const update = (taskId: string, userResponse: string) => {
    if (!taskId || !userResponse || userResponse.length === 0) return

    const data = {
      type: 'FreeResponse',
      user_response: userResponse,
    }

    Layer.submitUserResponse(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
      body: data,
    }).then(() => refetch())
  }

  return {
    data: data?.data,
    isLoading,
    isValidating,
    error,
    refetch,
    update,
  }
}
