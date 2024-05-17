import { TaskTypes } from '../../types/tasks'
import { get, post } from './authenticated_http'

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
