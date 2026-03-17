import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useBankTransactionsDownload } from '@hooks/api/businesses/[business-id]/reports/transactions/exports/excel/useBankTransactionsDownload'
import { bankTransactionFiltersToHookOptions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'
import { useInvisibleDownload } from '@components/utility/InvisibleDownload'

export function useHandleDownloadTransactions({ isListView }: { isListView: boolean }) {
  const { t } = useTranslation()
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
            content: t('bankTransactions:error.download_retry', 'Download failed, please retry'),
            type: 'error',
          })
        }
      })
      .catch(() => {
        addToast({ content: t('bankTransactions:error.download_retry', 'Download failed, please retry'), type: 'error' })
      })
  }, [addToast, filters, isListView, trigger, triggerInvisibleDownload, t])

  return useMemo(() => ({
    handleDownloadTransactions,
    invisibleDownloadRef,
    isMutating,
    error,
  }), [handleDownloadTransactions, invisibleDownloadRef, isMutating, error])
}
