import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { MatchType } from '@schemas/bankTransactions/match'
import { useMatchBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/match/useMatchBankTransaction'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useMatchBankTransactionWithCacheUpdate() {
  const { t } = useTranslation()
  const { addToast, eventCallbacks } = useLayerContext()
  const { updateLocalBankTransactions, data } = useBankTransactionsContext()

  const { trigger: matchBankTransaction, isMutating, isError } = useMatchBankTransaction()

  const match = useCallback(
    async (bankTransaction: BankTransaction, suggestedMatchId: string, notify?: boolean) => {
      return matchBankTransaction({
        bankTransactionId: bankTransaction.id,
        match_id: suggestedMatchId,
        type: 'Confirm_Match',
      })
        .then((matchResult) => {
          const transactionsToUpdate: BankTransaction[] = [
            {
              ...bankTransaction,
              categorization_status: CategorizationStatus.MATCHED,
              match: matchResult,
              recently_categorized: true,
            },
          ]

          if (matchResult.match_type === MatchType.TRANSFER) {
            const matchedTransferBankTransactionId = matchResult.details.id

            const matchedTransferBankTransaction = matchedTransferBankTransactionId
              ? data?.find(({ id }) => id === matchedTransferBankTransactionId)
              : undefined

            if (matchedTransferBankTransaction) {
              transactionsToUpdate.push({
                ...matchedTransferBankTransaction,
                categorization_status: CategorizationStatus.MATCHED,
                recently_categorized: true,
              })
            }
          }

          updateLocalBankTransactions(transactionsToUpdate)

          if (notify) {
            addToast({ content: t('bankTransactions:label.transaction_saved', 'Transaction saved') })
          }
        })
        .finally(() => {
          eventCallbacks?.onTransactionCategorized?.()
        })
    },
    [matchBankTransaction, updateLocalBankTransactions, data, addToast, eventCallbacks, t],
  )

  return useMemo(
    () => ({ match, isMutating, isError }),
    [match, isMutating, isError],
  )
}
