import { useCallback } from 'react'

import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { usePostBulkCategorize } from '@api/businesses/[business-id]/bank-transactions/bulk-categorize/post'
import { usePostBulkUncategorize } from '@api/businesses/[business-id]/bank-transactions/bulk-uncategorize/post'

/*
 * The @api hooks own cache invalidation; notifying the host app is wiring that belongs out here,
 * because it reads LayerContext. Per-call `swrOptions` merge key by key over the hook's defaults,
 * so `throwOnError` is preserved.
 */
function useOnTransactionCategorized() {
  const { eventCallbacks } = useLayerContext()

  return useCallback(() => {
    eventCallbacks?.onTransactionCategorized?.()
  }, [eventCallbacks])
}

export function useBulkCategorizeBankTransactions() {
  return usePostBulkCategorize({ swrOptions: { onSuccess: useOnTransactionCategorized() } })
}

export function useBulkUncategorizeBankTransactions() {
  return usePostBulkUncategorize({ swrOptions: { onSuccess: useOnTransactionCategorized() } })
}
