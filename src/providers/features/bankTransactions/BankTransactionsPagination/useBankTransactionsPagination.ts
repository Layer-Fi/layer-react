import { useCallback } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { type BankTransactionFilters } from '@utils/features/bankTransactions/shared'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { PaginationChangeSource, type TablePaginationProps } from '@hooks/utils/pagination/types'
import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { useCurrentBankTransactionsPage } from '@providers/features/bankTransactions/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'

type UseBankTransactionsPaginationParams = {
  data?: BankTransaction[]
  hasMore?: boolean
  fetchMore: () => void
  filters?: BankTransactionFilters
  pageSize: number
}

export function useBankTransactionsPagination({
  data,
  hasMore,
  fetchMore,
  filters,
  pageSize,
}: UseBankTransactionsPaginationParams): TablePaginationProps {
  const { currentBankTransactionsPage: pageIndex, setCurrentBankTransactionsPage: setPageIndex } = useCurrentBankTransactionsPage()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)

  const handlePageChange = useCallback((nextPageIndex: number, source: PaginationChangeSource) => {
    if (nextPageIndex === pageIndex) return

    setPageIndex(nextPageIndex)

    if (source === PaginationChangeSource.User) {
      emitLayerEvent({
        type: LayerEventType.TransactionsPageChanged,
        version: 1,
        payload: { page: nextPageIndex + 1 },
      })
    }
  }, [pageIndex, emitLayerEvent, setPageIndex])

  return useTablePaginationProps({
    filterParams: filters,
    data,
    pageSize,
    hasMore,
    fetchMore,
    pageIndex,
    onPageIndexChange: handlePageChange,
  })
}
