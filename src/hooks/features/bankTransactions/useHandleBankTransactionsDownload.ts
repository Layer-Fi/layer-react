import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useGetBankTransactionsDownload } from '@api/businesses/[business-id]/reports/transactions/exports/excel/get'
import { bankTransactionFiltersToHookOptions } from '@hooks/features/bankTransactions/useAugmentedBankTransactions'
import { useEmitLayerEvent } from '@hooks/useEmitLayerEvent'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { LayerEventComponent, LayerEventType } from '@providers/global/LayerProvider/layerEvents'
import { useBankTransactionsFiltersContext } from '@contexts/BankTransactionsFiltersContext/BankTransactionsFiltersContext'
import { useInvisibleDownload } from '@components/utility/InvisibleDownload'

export function useHandleDownloadTransactions({ isListView }: { isListView: boolean }) {
  const { t } = useTranslation()
  const { addToast } = useLayerContext()
  const { filters } = useBankTransactionsFiltersContext()
  const { invisibleDownloadRef, triggerInvisibleDownload } = useInvisibleDownload()
  const emitLayerEvent = useEmitLayerEvent(LayerEventComponent.BankTransactions)

  const { trigger, error, isMutating } = useGetBankTransactionsDownload()

  const handleDownloadTransactions = useCallback(() => {
    emitLayerEvent({
      type: LayerEventType.TransactionsDownloadClicked,
      version: 1,
      payload: {},
    })

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
  }, [addToast, emitLayerEvent, filters, isListView, trigger, triggerInvisibleDownload, t])

  return useMemo(() => ({
    handleDownloadTransactions,
    invisibleDownloadRef,
    isMutating,
    error,
  }), [handleDownloadTransactions, invisibleDownloadRef, isMutating, error])
}
