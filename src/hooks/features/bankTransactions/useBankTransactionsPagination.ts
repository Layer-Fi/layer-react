import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { type BankTransactionFilters } from '@utils/bankTransactions/shared'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { PaginationChangeSource } from '@hooks/utils/pagination/types'
import { useAutoResetPageIndex } from '@hooks/utils/pagination/useAutoResetPageIndex'
import { useCurrentBankTransactionsPage } from '@providers/BankTransactionsRouteStore/BankTransactionsRouteStoreProvider'
import { LayerEventComponent, LayerEventType } from '@providers/LayerProvider/layerEvents'
import { type TablePaginationProps } from '@components/PaginatedDataTable/PaginatedDataTable'

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
  const { currentBankTransactionsPage: currentPage, setCurrentBankTransactionsPage: setCurrentPage } = useCurrentBankTransactionsPage()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)
  const autoResetPageIndexRef = useAutoResetPageIndex(filters, data)

  const handlePageChange = useCallback((pageIndex: number, source: PaginationChangeSource) => {
    const page = pageIndex + 1

    if (page === currentPage) return

    setCurrentPage(page)

    if (source === PaginationChangeSource.User) {
      emitLayerEvent({
        type: LayerEventType.TransactionsPageChanged,
        version: 1,
        payload: { page },
      })
    }
  }, [currentPage, emitLayerEvent, setCurrentPage])

  return useMemo<TablePaginationProps>(() => ({
    pageIndex: currentPage - 1,
    onPageIndexChange: handlePageChange,
    pageSize,
    hasMore,
    fetchMore,
    autoResetPageIndexRef,
  }), [autoResetPageIndexRef, currentPage, fetchMore, handlePageChange, hasMore, pageSize])
}
