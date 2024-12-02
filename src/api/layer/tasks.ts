import { FileMetadata } from '../../types/file_upload'
import { TaskTypes } from '../../types/tasks'
import { get, post, postWithFormData } from './authenticated_http'

export const getTasks = get<{ data: TaskTypes[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/tasks`,
)

export const submitResponseToTask = post<{ data: TaskTypes }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/user-response`,
)

export const updateUploadDocumentTaskDescription = post<{ data: TaskTypes }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/upload/update-description`,
)

export const markTaskAsComplete = post<{ data: TaskTypes }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/complete`,
)

export const deleteTaskUploads = post<{ data: TaskTypes }>(
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
    description && formData.append('description', description)

    const endpoint = `/v1/businesses/${businessId}/tasks/${taskId}/upload`
    return postWithFormData<{ data: FileMetadata; errors: unknown }>(
      endpoint,
      formData,
      baseUrl,
      accessToken,
    )
  }
