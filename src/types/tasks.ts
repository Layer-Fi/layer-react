export interface TaskTypes {
  id: string
  question: string
  status: TasksStatusType
  title: string
  transaction_id: string | null
  type: string
  user_marked_completed_at: string
  user_response: string
  user_response_type: TasksResponseType
  archived_at: string | null
  completed_at: string
  created_at: string
  updated_at: string
}

export type TasksStatusType = 'COMPLETED' | 'TODO'
export type TasksResponseType = 'FREE_RESPONSE'
