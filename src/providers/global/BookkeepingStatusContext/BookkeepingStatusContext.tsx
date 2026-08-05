import { createContext, type PropsWithChildren, useContext, useMemo } from 'react'

import { BookkeepingStatus, type BookkeepingStatusData } from '@schemas/bookkeeping/bookkeepingStatus'
import { isActiveBookkeepingStatus as checkIsActiveBookkeepingStatus } from '@utils/features/bookkeeping/bookkeepingStatusFilters'
import { useGetBookkeepingStatus } from '@api/businesses/[business-id]/bookkeeping/status/get'
import { type SWRQueryResult } from '@hooks/utils/swr/SWRResponseTypes'

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
  } = useGetBookkeepingStatus()

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
