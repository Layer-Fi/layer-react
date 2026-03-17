import { type DocumentType } from '@internal-types/fileUpload'
import { type S3PresignedUrl } from '@internal-types/general'

type Document = {
  document_type: DocumentType
  file_name: string
  presigned_url: S3PresignedUrl
}

type RawTaskBase = {
  id: string
  task_run_id: string | null
  status: TasksStatus
  title: string
  type: string
  period_id: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
  effective_date: string | null
}

export type RawHumanTask = RawTaskBase & {
  type: 'Human_Task'
  question: string
  transaction_id: string | null
  user_marked_completed_at: string | null
  completed_at: string | null
  user_response: string | null
  user_response_type: TasksResponseType
  document_type: DocumentType
  document: Document | null
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
  counterparty_filter: string | null
  category: unknown
  bank_direction_filter: string | null
}

type AutomatedTaskSuggestionStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED'

export type AutomatedTaskAffectedTransaction = {
  id: string
  date: string
  amount: number
  counterparty_name: string
  direction: string
  description: string | null
}

type AutomatedTaskSuggestion = {
  type: 'Create_One_Of_Suggested_Categorization_Rules_For_Counterparty'
  id: string
  suggested_rules: ReadonlyArray<AutomatedTaskSuggestedRule>
  counterparty: AutomatedTaskCounterparty
  transactions_that_will_be_affected: ReadonlyArray<AutomatedTaskAffectedTransaction>
  accepted_at: string | null
  dismissed_at: string | null
  status: AutomatedTaskSuggestionStatus
}

export type RawAutomatedTask = RawTaskBase & {
  type: 'Automated_Task'
  task_type: 'AUTOMATED'
  source_suggestion_id: string | null
  suggestion: AutomatedTaskSuggestion
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
