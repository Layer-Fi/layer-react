import { type DocumentType } from '@internal-types/fileUpload'
import { type S3PresignedUrl } from '@internal-types/general'

type Document = {
  document_type: DocumentType
  file_name: string
  presigned_url: S3PresignedUrl
}

type RawTaskBase = {
  id: string
  status: TasksStatus
  title: string
  type: string
  archived_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  effective_date: string
}

export type RawHumanTask = RawTaskBase & {
  type: 'Human_Task'
  question: string
  transaction_id: string | null
  user_marked_completed_at: string | null
  user_response: string | null
  user_response_type: TasksResponseType
  document_type: DocumentType
  documents: Document[]
}

type AutomatedTaskCounterparty = {
  id: string
  external_id: string | null
  name: string
  counterparty_source: string
  website: string | null
  logo: string | null
  mccs: ReadonlyArray<string>
  counterparty_type: string | null
}

type AutomatedTaskSuggestedRule = {
  apply_retroactively: boolean
  created_by_suggestion_id: string | null
  external_id: string | null
  name: string | null
  category: unknown
  suggestion_1: unknown
  suggestion_2: unknown
  suggestion_3: unknown
  business_name_filter: string | null
  client_name_filter: string | null
  merchant_type_filter: string | null
  transaction_description_filter: string | null
  transaction_type_filter: string | null
  bank_direction_filter: string | null
  amount_min_filter: number | null
  amount_max_filter: number | null
}

export type AutomatedTaskUncategorizedTransaction = {
  id: string
  date: string
  amount: number
  counterparty_name: string | null
}

type AutomatedRuleSuggestionReviewPayload = {
  type: 'Automated_Rule_Suggestion_Review'
  counterparty: AutomatedTaskCounterparty
  suggestion_id: string
  suggested_rules: ReadonlyArray<AutomatedTaskSuggestedRule>
  uncategorized_transactions: ReadonlyArray<AutomatedTaskUncategorizedTransaction>
}

export type RawAutomatedTask = RawTaskBase & {
  type: 'Automated_Task'
  task_type: 'Automated'
  source_suggestion_id: string | null
  payload: AutomatedRuleSuggestionReviewPayload
}

export type RawTask = RawHumanTask | RawAutomatedTask

const _TASKS_STATUSES = [
  'TODO',
  'USER_MARKED_COMPLETED',
  'COMPLETED',
  'ARCHIVED',
] as const

export type TasksStatus = typeof _TASKS_STATUSES[number]
export type TasksResponseType = 'FREE_RESPONSE' | 'UPLOAD_DOCUMENT'
