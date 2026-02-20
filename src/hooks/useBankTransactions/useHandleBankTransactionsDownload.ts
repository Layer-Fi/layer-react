import { useCallback, useMemo } from 'react'

import { bankTransactionFiltersToHookOptions } from '@hooks/useBankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsDownload } from '@hooks/useBankTransactions/useBankTransactionsDownload'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useInvisibleDownload } from '@components/utility/InvisibleDownload'

export function useHandleDownloadTransactions({ isListView }: { isListView: boolean }) {
  const { addToast } = useLayerContext()
  const { filters } = useBankTransactionsFiltersContext()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()

  const { trigger, error, isMutating } = useBankTransactionsDownload()

  const handleDownloadTransactions = useCallback(() => {
    return void trigger(bankTransactionFiltersToHookOptions(filters))
      .then((result) => {
        if (result?.presignedUrl) {
          triggerInvisibleDownload({ url: result.presignedUrl })
        }
        else if (isListView) {
          addToast({
            content: 'Download Failed, Please Retry',
            type: 'error',
          })
        }
      })
      .catch(() => {
        addToast({ content: 'Download Failed, Please Retry', type: 'error' })
      })
  }, [addToast, filters, isListView, trigger, triggerInvisibleDownload])

  return useMemo(() => ({
    handleDownloadTransactions,
    invisibleDownloadRef,
    isMutating,
    error,
  }), [handleDownloadTransactions, invisibleDownloadRef, isMutating, error])
}
