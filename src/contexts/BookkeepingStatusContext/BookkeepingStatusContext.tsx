import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

import { type SWRQueryResult } from '@internal-types/swr/SWRResponseTypes'
import { BookkeepingStatus, type BookkeepingStatusData } from '@schemas/bookkeepingStatus'
import { isActiveBookkeepingStatus as checkIsActiveBookkeepingStatus } from '@utils/bookkeeping/bookkeepingStatusFilters'
import { useBookkeepingStatus } from '@hooks/api/businesses/[business-id]/bookkeeping/status/useBookkeepingStatus'

type BookkeepingStatusContextValue = Pick<
  SWRQueryResult<BookkeepingStatusData>,
  | 'data'
  | 'isError'
  | 'isLoading'
  | 'isValidating'
  | 'refetch'
> & {
  status: BookkeepingStatus
  isActiveBookkeepingStatus: boolean
}

const BookkeepingStatusContext = createContext<BookkeepingStatusContextValue>({
  data: undefined,
  isError: false,
  isLoading: false,
  isValidating: false,
  refetch: () => Promise.resolve(undefined),
  status: BookkeepingStatus.NOT_PURCHASED,
  isActiveBookkeepingStatus: false,
})

export function BookkeepingStatusProvider({ children }: PropsWithChildren) {
  const {
    data,
    isError,
    isLoading,
    isValidating,
    refetch,
  } = useBookkeepingStatus()

  const value = useMemo<BookkeepingStatusContextValue>(() => {
    const status = data?.status ?? BookkeepingStatus.NOT_PURCHASED

    return {
      data,
      isError,
      isLoading,
      isValidating,
      refetch,
      status,
      isActiveBookkeepingStatus: checkIsActiveBookkeepingStatus(status),
    }
  }, [
    data,
    isError,
    isLoading,
    isValidating,
    refetch,
  ])

  return (
    <BookkeepingStatusContext.Provider value={value}>
      {children}
    </BookkeepingStatusContext.Provider>
  )
}

export function useBookkeepingStatusContext() {
  return useContext(BookkeepingStatusContext)
}
