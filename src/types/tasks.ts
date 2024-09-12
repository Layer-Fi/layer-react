import { DocumentType } from './file_upload'

export interface TaskTypes {
  id: string
  question: string
  status: TasksStatusType
  title: string
  transaction_id: string | null
  type: string
  user_marked_completed_at: string | null
  user_response: string | null
  user_response_type: TasksResponseType
  archived_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  document_type: DocumentType
}

export type TasksStatusType = 'COMPLETED' | 'TODO' | 'USER_MARKED_COMPLETED'
export type TasksResponseType = 'FREE_RESPONSE' | 'UPLOAD_DOCUMENT'

const COMPLETED_TASK_TYPES = ['COMPLETED', 'USER_MARKED_COMPLETED']

export function isComplete(taskType: TasksStatusType) {
  return COMPLETED_TASK_TYPES.includes(taskType)
}
