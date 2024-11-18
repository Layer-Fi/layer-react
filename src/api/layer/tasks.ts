import { FileMetadata } from '../../types/file_upload'
import { Task } from '../../types/tasks'
import { get, post, postWithFormData } from './authenticated_http'

export const getTasks = get<{ data: Task[] }>(
  ({ businessId, startDate, endDate }) => `/v1/businesses/${businessId}/tasks?${
      startDate ? `&start_date=${encodeURIComponent(startDate)}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(endDate)}` : ''}`,
)

export const submitResponseToTask = post<{ data: Task }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/user-response`,
)

export const markTaskAsComplete = post<{ data: Task }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/complete`,
)

export const completeTaskWithUpload =
  (baseUrl: string, accessToken?: string) =>
  ({
    businessId,
    taskId,
    file,
  }: {
    businessId: string
    taskId: string
    file: File
  }) => {
    const formData = new FormData()
    formData.append('file', file)

    const endpoint = `/v1/businesses/${businessId}/tasks/${taskId}/upload`
    return postWithFormData<{ data: FileMetadata; errors: unknown }>(
      endpoint,
      formData,
      baseUrl,
      accessToken,
    )
  }
