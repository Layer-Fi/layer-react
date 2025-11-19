import { type FileMetadata } from '@internal-types/file_upload'
import { type RawTask } from '@internal-types/tasks'
import { post, postWithFormData } from '@api/layer/authenticated_http'

type SubmitUserResponseForTaskBody = {
  type: 'FreeResponse'
  user_response: string
}

export const submitUserResponseForTask = post<
  { data: RawTask },
  SubmitUserResponseForTaskBody,
  {
    businessId: string
    taskId: string
  }
>(
  ({ businessId, taskId }) => `/v1/businesses/${businessId}/tasks/${taskId}/user-response`,
)

type UpdateTaskUploadsDescriptionBody = {
  type: 'FreeResponse'
  user_response: string
}

export const updateTaskUploadsDescription = post<
  { data: RawTask },
  UpdateTaskUploadsDescriptionBody,
  {
    businessId: string
    taskId: string
  }
>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/upload/update-description`,
)

export const deleteUploadsOnTask = post<
  { data: RawTask },
  Record<string, never>,
  {
    businessId: string
    taskId: string
  }
>(
  ({ businessId, taskId }) =>
    `/v1/businesses/${businessId}/tasks/${taskId}/upload/delete`,
)

export function completeTaskWithUpload(
  baseUrl: string,
  accessToken: string,
  {
    businessId,
    taskId,
    files,
    description,
  }: {
    businessId: string
    taskId: string
    files: ReadonlyArray<File>
    description?: string
  },
) {
  const formData = new FormData()
  files.forEach(file => formData.append('file', file))
  if (description) {
    formData.append('description', description)
  }

  const endpoint = `/v1/businesses/${businessId}/tasks/${taskId}/upload`
  return postWithFormData<{ data: FileMetadata }>(
    endpoint,
    formData,
    baseUrl,
    accessToken,
  )
}
