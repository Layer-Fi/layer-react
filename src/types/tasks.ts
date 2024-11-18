import { DocumentType } from './file_upload'
import { S3PresignedUrl } from './general'

interface Document {
  document_type: DocumentType
  file_name: string,
  presigned_url: S3PresignedUrl
  // add the other fields if/when necessary
}

export interface Task {
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
  effective_date: string
  document_type: DocumentType
  documents: Document[]
}

export type TasksStatusType = 'COMPLETED' | 'TODO' | 'USER_MARKED_COMPLETED'
export type TasksResponseType = 'FREE_RESPONSE' | 'UPLOAD_DOCUMENT'

const COMPLETED_TASK_TYPES = ['COMPLETED', 'USER_MARKED_COMPLETED']

export function isComplete(taskType: TasksStatusType) {
  return COMPLETED_TASK_TYPES.includes(taskType)
}

export interface TasksMonthly {
  year: number;
  month: number;
  total: number;
  completed: number;
  tasks: Task[];
}
