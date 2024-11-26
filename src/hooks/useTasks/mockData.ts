import { TaskTypes } from '../../types/tasks'

export const mockData: TaskTypes[] = [
  {
    id: 'f49e6eb2-52d4-4872-b34a-2baf387b8592',
    question: 'What is your favorite food?',
    status: 'TODO',
    title: 'Favorite Food',
    transaction_id: null,
    type: 'Business_Task',
    user_marked_completed_at: null,
    user_response: null,
    user_response_type: 'FREE_RESPONSE',
    archived_at: null,
    completed_at: null,
    created_at: '2024-09-12T05:56:49.360176Z',
    updated_at: '2024-09-12T05:56:49.360176Z',
    document_type: 'LOAN_STATEMENT',
    document: [],
  },
  {
    id: 'f49e6eb2-52d4-4872-b34a-2baf387b8593',
    status: 'TODO',
    title: 'May Bank Statement',
    question: 'Please upload your Wells Fargo Bank statement for May',
    transaction_id: null,
    type: 'Business_Task',
    user_marked_completed_at: null,
    user_response: null,
    user_response_type: 'UPLOAD_DOCUMENT',
    archived_at: null,
    completed_at: null,
    created_at: '2024-09-12T05:56:49.360176Z',
    updated_at: '2024-09-12T05:56:49.360176Z',
    document_type: 'BANK_STATEMENT',
    document: []
  },
]
