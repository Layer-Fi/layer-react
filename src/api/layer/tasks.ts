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

export const updateUploadDocumentTaskDescription = post<{ data: Task }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/upload/update-description`,
)

export const markTaskAsComplete = post<{ data: Task }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/complete`,
)

export const deleteTaskUploads = post<{ data: Task }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/upload/delete`,
)

export const completeTaskWithUpload =
  (baseUrl: string, accessToken?: string) =>
    ({
      businessId,
      taskId,
      files,
      description,
    }: {
      businessId: string
      taskId: string
      files: File[]
      description?: string
    }) => {
      const formData = new FormData()
      files.forEach(file => formData.append('file', file))
      if (description) {
        formData.append('description', description)
      }

      const endpoint = `/v1/businesses/${businessId}/tasks/${taskId}/upload`
      return postWithFormData<{ data: FileMetadata, errors: unknown }>(
        endpoint,
        formData,
        baseUrl,
        accessToken,
      )
    }
