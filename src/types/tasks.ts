import { type DocumentType } from '@internal-types/file_upload'
import { type S3PresignedUrl } from '@internal-types/general'

type Document = {
  document_type: DocumentType
  file_name: string
  presigned_url: S3PresignedUrl
}

export type RawTask = {
  id: string
  question: string
  status: TasksStatus
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

const _TASKS_STATUSES = [
  'TODO',
  'USER_MARKED_COMPLETED',
  'COMPLETED',
  'ARCHIVED',
] as const

export type TasksStatus = typeof _TASKS_STATUSES[number]
export type TasksResponseType = 'FREE_RESPONSE' | 'UPLOAD_DOCUMENT'
