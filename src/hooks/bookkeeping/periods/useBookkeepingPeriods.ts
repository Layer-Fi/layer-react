import useSWR from 'swr'
import { useLayerContext } from '../../../contexts/LayerContext'
import { useAuth } from '../../useAuth'
import { get } from '../../../api/layer/authenticated_http'
import {
  isActiveBookkeepingStatus,
  useBookkeepingStatus,
} from '../useBookkeepingStatus'
import type { Task } from '../../../types/tasks'
import type { EnumWithUnknownValues } from '../../../types/utility/enumWithUnknownValues'

/** @TODO - mock */
const MOCK_DATA: BookkeepingPeriod[] = [
  {
    id: '2025-04',
    month: 4,
    year: 2025,
    status: 'NOT_STARTED',
    tasks: [
      {
        id: 'task-1',
        title: 'Review April Transactions',
        question: 'Please review all April transactions',
        status: 'TODO',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: null,
        user_response: null,
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: null,
        created_at: '2025-04-01T00:00:00Z',
        updated_at: '2025-04-01T00:00:00Z',
        effective_date: '2025-04-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
    ],
  },
  {
    id: '2025-03',
    month: 3,
    year: 2025,
    status: 'IN_PROGRESS_AWAITING_CUSTOMER',
    tasks: [
      {
        id: 'task-2',
        title: 'March Bank Reconciliation',
        question: 'Complete bank reconciliation for March',
        status: 'TODO',
        transaction_id: null,
        type: 'RECONCILIATION',
        user_marked_completed_at: null,
        user_response: null,
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: null,
        created_at: '2025-03-01T00:00:00Z',
        updated_at: '2025-03-01T00:00:00Z',
        effective_date: '2025-03-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
    ],
  },
  {
    id: '2025-02',
    month: 2,
    year: 2025,
    status: 'IN_PROGRESS_AWAITING_BOOKKEEPER',
    tasks: [
      {
        id: 'task-3',
        title: 'February Review',
        question: 'Review February financial statements',
        status: 'COMPLETED',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: '2025-03-01T00:00:00Z',
        user_response: 'Completed review of February statements',
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: '2025-03-01T00:00:00Z',
        created_at: '2025-02-01T00:00:00Z',
        updated_at: '2025-03-01T00:00:00Z',
        effective_date: '2025-02-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
    ],
  },
  {
    id: '2025-01',
    month: 1,
    year: 2025,
    status: 'CLOSED_OPEN_TASKS',
    tasks: [
      {
        id: 'task-4',
        title: 'January Review',
        question: 'Review January financial statements',
        status: 'COMPLETED',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: '2025-02-01T00:00:00Z',
        user_response: 'Completed review of January statements',
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: '2025-02-01T00:00:00Z',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-02-01T00:00:00Z',
        effective_date: '2025-01-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
    ],
  },
  {
    id: '2023-12',
    month: 12,
    year: 2024,
    status: 'CLOSING_IN_REVIEW',
    tasks: [
      {
        id: 'task-5',
        title: 'December Review',
        question: 'Review December financial statements',
        status: 'COMPLETED',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: '2025-01-01T00:00:00Z',
        user_response: 'Completed review of December statements',
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: '2025-01-01T00:00:00Z',
        created_at: '2024-12-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        effective_date: '2024-12-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
    ],
  },
  {
    id: '2024-11',
    month: 11,
    year: 2024,
    status: 'CLOSED_COMPLETE',
    tasks: [
      {
        id: 'task-6',
        title: 'November Review',
        question: 'Review November financial statements',
        status: 'COMPLETED',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: '2024-12-01T00:00:00Z',
        user_response: 'Completed review of November statements',
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: '2024-12-01T00:00:00Z',
        created_at: '2024-11-01T00:00:00Z',
        updated_at: '2024-12-01T00:00:00Z',
        effective_date: '2024-11-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
    ],
  },
  {
    id: '2024-10',
    month: 10,
    year: 2024,
    status: 'CLOSED_COMPLETE',
    tasks: [
      {
        id: 'task-7',
        title: 'October Review',
        question: 'Review October financial statements',
        status: 'TODO',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: '2024-11-01T00:00:00Z',
        user_response: 'Completed review of October statements',
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: '2024-11-01T00:00:00Z',
        created_at: '2024-10-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z',
        effective_date: '2023-10-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
      {
        id: 'task-7b',
        title: 'October Review',
        question: 'Review October financial statements',
        status: 'TODO',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: '2024-11-01T00:00:00Z',
        user_response: 'Completed review of October statements',
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: '2024-11-01T00:00:00Z',
        created_at: '2024-10-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z',
        effective_date: '2023-10-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
      {
        id: 'task-7c',
        title: 'October Review',
        question: 'Review October financial statements',
        status: 'COMPLETED',
        transaction_id: null,
        type: 'REVIEW',
        user_marked_completed_at: '2024-11-01T00:00:00Z',
        user_response: 'Completed review of October statements',
        user_response_type: 'FREE_RESPONSE',
        archived_at: null,
        completed_at: '2024-11-01T00:00:00Z',
        created_at: '2024-10-01T00:00:00Z',
        updated_at: '2024-11-01T00:00:00Z',
        effective_date: '2023-10-01T00:00:00Z',
        document_type: 'BANK_STATEMENT',
        documents: [],
      },
    ],
  },
]

const BOOKKEEPING_PERIOD_STATUSES = [
  'BOOKKEEPING_NOT_PURCHASED',
  'NOT_STARTED',
  'IN_PROGRESS_AWAITING_BOOKKEEPER',
  'IN_PROGRESS_AWAITING_CUSTOMER',
  'CLOSING_IN_REVIEW',
  'CLOSED_OPEN_TASKS',
  'CLOSED_COMPLETE',
] as const

export type BookkeepingPeriodStatus = typeof BOOKKEEPING_PERIOD_STATUSES[number]
type RawBookkeepingPeriodStatus = EnumWithUnknownValues<BookkeepingPeriodStatus>

function constrainToKnownBookkeepingPeriodStatus(status: string): BookkeepingPeriodStatus {
  if (BOOKKEEPING_PERIOD_STATUSES.includes(status as BookkeepingPeriodStatus)) {
    return status as BookkeepingPeriodStatus
  }

  return 'BOOKKEEPING_NOT_PURCHASED'
}

export type BookkeepingPeriod = Omit<RawBookkeepingPeriod, 'status'> & {
  status: BookkeepingPeriodStatus
}

type RawBookkeepingPeriod = {
  id: string
  month: number
  year: number
  status: RawBookkeepingPeriodStatus
  tasks: ReadonlyArray<Task>
}

const getBookkeepingPeriods = get<
  {
    data: {
      periods: ReadonlyArray<RawBookkeepingPeriod>
    }
  },
  { businessId: string }
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/bookkeeping/periods`
})

function buildKey({
  access_token: accessToken,
  apiUrl,
  businessId,
  isActive,
}: {
  access_token?: string
  apiUrl?: string
  businessId: string
  isActive: boolean
}) {
  if (accessToken && apiUrl && isActive) {
    return {
      accessToken,
      apiUrl,
      businessId,
      tags: ['#bookkeeping', '#periods'],
    } as const
  }
}

export function useBookkeepingPeriods() {
  const { data: auth } = useAuth()
  const { businessId } = useLayerContext()

  const { data } = useBookkeepingStatus()
  const isActive = data ? isActiveBookkeepingStatus(data.status) : false

  return useSWR(
    () => buildKey({
      ...auth,
      businessId,
      isActive,
    }),
    ({ accessToken, apiUrl, businessId }) => getBookkeepingPeriods(
      apiUrl,
      accessToken,
      { params: { businessId } },
    )()
      .then(
        ({ data: { periods } }) => {
          const _a = periods.map(period => ({
            ...period,
            status: constrainToKnownBookkeepingPeriodStatus(period.status),
          }))
          return MOCK_DATA.map(period => ({
            ...period,
            test: Math.random(),
            status: constrainToKnownBookkeepingPeriodStatus(period.status),
          }))
        },
      ),
  )
}
