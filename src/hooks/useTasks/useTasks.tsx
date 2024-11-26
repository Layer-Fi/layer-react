import { useEffect, useMemo, useState } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { LoadedStatus } from '../../types/general'
import { DataModel } from '../../types/general'
import { isComplete, Task, TasksMonthly } from '../../types/tasks'
import { mockData } from './mockData'
import useSWR from 'swr'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { endOfYear, formatISO, getMonth, getYear, parseISO, startOfYear } from 'date-fns'

type UseTasks = (props?: UseTasksProps) => {
  data?: Task[]
  monthlyData?: TasksMonthly[]
  isLoading?: boolean
  loadedStatus?: LoadedStatus
  isValidating?: boolean
  error?: unknown
  currentDate: Date
  setCurrentDate: (date: Date) => void
  dateRange: { startDate: Date, endDate: Date }
  setDateRange: (props: { startDate: Date, endDate: Date }) => void
  refetch: () => void
  submitResponseToTask: (taskId: string, userResponse: string) => void
  uploadDocumentsForTask: (taskId: string, files: File[], description?: string) => Promise<void>
  deleteUploadsForTask: (taskId: string) => void
  updateDocUploadTaskDescription: (taskId: string, userResponse: string) => void
}

type UseTasksProps = {
  startDate?: Date,
  endDate?: Date
}

const DEBUG_MODE = false

export const useTasks: UseTasks = ({
  startDate: initialStartDate = startOfYear(new Date()),
  endDate: initialEndDate = endOfYear(new Date())
}: UseTasksProps = {}) => {
  const [loadedStatus, setLoadedStatus] = useState<LoadedStatus>('initial')

  const { businessId, read, syncTimestamps, hasBeenTouched } = useLayerContext()

  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const [dateRange, setDateRange] = useState({ startDate: initialStartDate, endDate: initialEndDate })
  const [currentDate, setCurrentDate] = useState(new Date())

  const queryKey = businessId && auth?.access_token && `tasks-${businessId}-${dateRange.startDate}-${dateRange.endDate}`

  const { data, isLoading, isValidating, error, mutate } = useSWR(
    queryKey,
    Layer.getTasks(apiUrl, auth?.access_token, {
      params: { businessId, startDate: formatISO(dateRange.startDate.valueOf()), endDate: formatISO(dateRange.endDate.valueOf()) },
    }),
  )

  const monthlyData = useMemo(() => {
    // Group tasks monthly
    if (data?.data) {
      const grouped = data.data.reduce((acc, task) => {
        const effectiveDate = task.effective_date ? parseISO(task.effective_date) : parseISO(task.created_at)
        const year = getYear(effectiveDate)
        const month = getMonth(effectiveDate)

        const key = `${year}-${month}`

        if (!acc[key]) {
          acc[key] = {
            year,
            month,
            total: 0,
            completed: 0,
            tasks: [],
          }
        }

        acc[key].tasks.push(task)

        if (isComplete(task.status)) {
          acc[key].completed += 1
        }

        acc[key].total += 1

        return acc
      }, {} as Record<string, TasksMonthly>)

      return Object.values(grouped)
    }

    return []
  }, [data])

  useEffect(() => {
    if (isLoading && loadedStatus === 'initial') {
      setLoadedStatus('loading')
    } else if (!isLoading && loadedStatus === 'loading') {
      setLoadedStatus('complete')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const refetch = () => mutate()

  const uploadDocumentsForTask = async (taskId: string, files: File[], description?: string) => {
    const uploadDocuments = Layer.completeTaskWithUpload(
      apiUrl,
      auth?.access_token,
    )
    await uploadDocuments({
      businessId,
      taskId,
      files,
      description
    }).then(refetch)
  }

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

  const deleteUploadsForTask = (taskId: string) => {
    Layer.deleteTaskUploads(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
    }).then(() => refetch())
  }

  const updateDocUploadTaskDescription = (taskId: string, userResponse: string) => {
    const data = {
      type: 'FreeResponse',
      user_response: userResponse,
    }

    Layer.updateUploadDocumentTaskDescription(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
      body: data,
    }).then(() => refetch())
  }

  // Refetch data if related models has been changed since last fetch
  useEffect(() => {
    if (queryKey && (isLoading || isValidating)) {
      read(DataModel.TASKS, queryKey)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, isValidating])

  useEffect(() => {
    if (queryKey && hasBeenTouched(queryKey)) {
      refetch()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTimestamps])

  return {
    data: DEBUG_MODE ? mockData : data?.data,
    monthlyData,
    isLoading,
    loadedStatus,
    isValidating,
    error,
    currentDate,
    setCurrentDate,
    dateRange,
    setDateRange,
    refetch,
    submitResponseToTask,
    uploadDocumentsForTask,
    deleteUploadsForTask,
    updateDocUploadTaskDescription,
  }
}
