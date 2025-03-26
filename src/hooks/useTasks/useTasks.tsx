import { useEffect } from 'react'
import { Layer } from '../../api/layer'
import { useLayerContext } from '../../contexts/LayerContext'
import { DataModel } from '../../types/general'
import { useAuth } from '../useAuth'
import { useEnvironment } from '../../providers/Environment/EnvironmentInputProvider'
import { startOfMonth } from 'date-fns'
import { getActivationDate } from '../../utils/business'
import { useGlobalDateRange, useGlobalDateRangeActions } from '../../providers/GlobalDateStore/GlobalDateStoreProvider'
import { BookkeepingPeriod, useBookkeepingPeriods } from '../bookkeeping/periods/useBookkeepingPeriods'

type UseTasks = () => {
  data?: BookkeepingPeriod[]
  isLoading?: boolean
  isValidating?: boolean
  error?: unknown
  currentDate: Date
  setCurrentDate: (date: Date) => void
  refetch: () => void
  submitResponseToTask: (taskId: string, userResponse: string) => void
  uploadDocumentsForTask: (taskId: string, files: File[], description?: string) => Promise<void>
  deleteUploadsForTask: (taskId: string) => void
  updateDocUploadTaskDescription: (taskId: string, userResponse: string) => void
}

export const useTasks: UseTasks = () => {
  const { start } = useGlobalDateRange()
  const { setMonth } = useGlobalDateRangeActions()

  const { data, mutate, isLoading, isValidating, error } = useBookkeepingPeriods()

  const currentDate = startOfMonth(start)

  const setCurrentDate = (date: Date) => {
    setMonth({ start: date })
  }

  // const [loadedStatus, setLoadedStatus] = useState<LoadedStatus>('initial')

  const { business, businessId, read, syncTimestamps, hasBeenTouched } = useLayerContext()
  const activationDate = getActivationDate(business)

  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()
  // const [currentDate, setCurrentDate] = useState(new Date())

  const queryKey = businessId && activationDate && auth?.access_token && `tasks-${businessId}-${activationDate.toISOString()}`

  // Group tasks monthly
  // const monthlyData = useMemo(() => {
  //   if (data?.data) {
  //     const grouped = data.data.reduce((acc, task) => {
  //       const effectiveDate = task.effective_date
  //         ? parseISO(task.effective_date)
  //         : parseISO(task.created_at)
  //       const year = getYear(effectiveDate)
  //       const month = getMonth(effectiveDate)

  //       const key = `${year}-${month}`

  //       if (!acc[key]) {
  //         acc[key] = {
  //           year,
  //           month,
  //           total: 0,
  //           completed: 0,
  //           tasks: [],
  //         }
  //       }

  //       acc[key].tasks.push(task)

  //       if (isComplete(task.status)) {
  //         acc[key].completed += 1
  //       }

  //       acc[key].total += 1

  //       return acc
  //     }, {} as Record<string, TasksMonthly>)

  //     return Object.values(grouped)
  //   }

  //   return []
  // }, [data])

  // const yearlyData = useMemo(() => {
  //   if (monthlyData) {
  //     const grouped = monthlyData.reduce((acc, record) => {
  //       if (!acc[record.year]) {
  //         acc[record.year] = {
  //           year: record.year,
  //           total: 0,
  //           completed: 0,
  //           months: [],
  //         }
  //       }

  //       acc[record.year].total += record.total
  //       acc[record.year].completed += record.completed
  //       acc[record.year].months.push(record)

  //       return acc
  //     }, {} as Record<string, TasksYearly>)

  //     return Object.values(grouped)
  //   }

  //   return []
  // }, [monthlyData])

  // const unresolvedTasks = useMemo(() => {
  //   if (data?.data) {
  //     return data.data.filter(x => !isComplete(x.status)).length
  //   }

  //   return
  // }, [data])

  // useEffect(() => {
  //   if (isLoading && loadedStatus === 'initial') {
  //     setLoadedStatus('loading')
  //   }
  //   else if (!isLoading && loadedStatus === 'loading') {
  //     setLoadedStatus('complete')
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [isLoading])

  // const refetch = () => mutate()

  const uploadDocumentsForTask = async (taskId: string, files: File[], description?: string) => {
    const uploadDocuments = Layer.completeTaskWithUpload(
      apiUrl,
      auth?.access_token,
    )
    await uploadDocuments({
      businessId,
      taskId,
      files,
      description,
    }).then(() => mutate())
  }

  const submitResponseToTask = (taskId: string, userResponse: string) => {
    if (!taskId || !userResponse || userResponse.length === 0) return

    const data = {
      type: 'FreeResponse',
      user_response: userResponse,
    }

    void Layer.submitResponseToTask(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
      body: data,
    }).then(() => mutate())
  }

  const deleteUploadsForTask = (taskId: string) => {
    void Layer.deleteTaskUploads(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
    }).then(() => mutate())
  }

  const updateDocUploadTaskDescription = (taskId: string, userResponse: string) => {
    const data = {
      type: 'FreeResponse',
      user_response: userResponse,
    }

    void Layer.updateUploadDocumentTaskDescription(apiUrl, auth?.access_token, {
      params: { businessId, taskId },
      body: data,
    }).then(() => mutate())
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
      void mutate()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncTimestamps])

  return {
    data,
    isLoading,
    isValidating,
    error,
    currentDate,
    setCurrentDate,
    refetch: () => void mutate(),
    submitResponseToTask,
    uploadDocumentsForTask,
    deleteUploadsForTask,
    updateDocUploadTaskDescription,
  }
}
