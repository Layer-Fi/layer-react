import { useCallback } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { type BankTransactionFilters } from '@utils/bankTransactions/shared'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { useTablePaginationProps } from '@hooks/utils/pagination/useTablePaginationProps'
import { useCurrentBankTransactionsPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'
import { type TablePaginationProps } from '@blocks/PaginatedDataTable/PaginatedDataTable'

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
