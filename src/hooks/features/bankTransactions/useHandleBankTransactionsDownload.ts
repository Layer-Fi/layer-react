import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LayerEventComponent, LayerEventType } from '@schemas/common/layerEvents'
import { useLayerContext } from '@providers/global/LayerContext/LayerContext'
import { useInvisibleDownload } from '@hooks/utils/download/useInvisibleDownload'
import { useEmitLayerEvent } from '@hooks/utils/events/useEmitLayerEvent'
import { useGetBankTransactionsDownload } from '@api/businesses/[business-id]/reports/transactions/exports/excel/get'
import { bankTransactionFiltersToHookOptions } from '@providers/features/bankTransactions/BankTransactions/useAugmentedBankTransactions'
import { useBankTransactionsFiltersContext } from '@providers/features/bankTransactions/BankTransactionsFiltersContext/BankTransactionsFiltersContext'

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
            content: t('bankTransactions:useHandleBankTransactionsDownload.error.download_retry', 'Download failed, please retry'),
            type: 'error',
          })
        }
      })
      .catch(() => {
        addToast({ content: t('bankTransactions:useHandleBankTransactionsDownload.error.download_retry', 'Download failed, please retry'), type: 'error' })
      })
  }, [addToast, emitLayerEvent, filters, isListView, trigger, triggerInvisibleDownload, t])

  return useMemo(() => ({
    handleDownloadTransactions,
    invisibleDownloadRef,
    isMutating,
    error,
  }), [handleDownloadTransactions, invisibleDownloadRef, isMutating, error])
}
