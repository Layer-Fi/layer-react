import { DocumentType, FileMetadata } from '../../types/file_upload'
import { TaskTypes } from '../../types/tasks'
import { get, post, postWithFormData } from './authenticated_http'

export const getTasks = get<{ data: TaskTypes[] }>(
  ({ businessId }) => `/v1/businesses/${businessId}/tasks`,
)

export const submitResponseToTask = post<{ data: TaskTypes }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/user-response`,
)

export const markTaskAsComplete = post<{ data: TaskTypes }>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/complete`,
)

export const completeTaskWithUpload =
  (baseUrl: string, accessToken: string) =>
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
