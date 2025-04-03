import { useEffect, useMemo } from 'react'
import { Layer } from '../api/layer'
import { useLayerContext } from '../contexts/LayerContext'
import { DataModel } from '../types/general'
import { useAuth } from './useAuth'
import { useEnvironment } from '../providers/Environment/EnvironmentInputProvider'
import { getMonth, getYear, startOfMonth } from 'date-fns'
import { getActivationDate } from '../utils/business'
import { useGlobalDate, useGlobalDateRangeActions } from '../providers/GlobalDateStore/GlobalDateStoreProvider'
import { useBookkeepingPeriods } from './bookkeeping/periods/useBookkeepingPeriods'

export const useTasks = () => {
  const { business, businessId, read, syncTimestamps, hasBeenTouched } = useLayerContext()
  const activationDate = getActivationDate(business)

  const { apiUrl } = useEnvironment()
  const { data: auth } = useAuth()

  const { date } = useGlobalDate()
  const { setMonth } = useGlobalDateRangeActions()

  const { data, mutate, isLoading, isValidating, error } = useBookkeepingPeriods()

  const currentMonthDate = startOfMonth(date)

  const setCurrentMonthDate = (date: Date) => {
    setMonth({ start: date })
  }

  const currentMonthData = useMemo(() => {
    if (!data) {
      return
    }

    return data.find(
      period => period.year === getYear(currentMonthDate) && period.month === getMonth(currentMonthDate) + 1,
    )
  }, [data, currentMonthDate])

  const currentYearData = useMemo(() => {
    if (!data) {
      return
    }

    return data.filter(period => period.year === getYear(currentMonthDate))
  }, [data, currentMonthDate])

  const queryKey = businessId && activationDate && auth?.access_token && `tasks-${businessId}-${activationDate.toISOString()}`

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
    currentMonthDate,
    setCurrentMonthDate,
    activationDate,
    currentMonthData,
    currentYearData,
    refetch: () => void mutate(),
    submitResponseToTask,
    uploadDocumentsForTask,
    deleteUploadsForTask,
    updateDocUploadTaskDescription,
  }
}
