import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { MatchType } from '@schemas/bankTransactions/match'
import { useMatchBankTransaction } from '@hooks/api/businesses/[business-id]/bank-transactions/[bank-transaction-id]/match/useMatchBankTransaction'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useMatchBankTransactionWithCacheUpdate() {
  const { eventCallbacks } = useLayerContext()
  const { updateLocalBankTransactions, data } = useBankTransactionsContext()

  const { trigger: matchBankTransaction, isMutating, isError } = useMatchBankTransaction()

  const match = useCallback(
    async (bankTransaction: BankTransaction, suggestedMatchId: string, options?: { onSuccess?: () => void }): Promise<void> => {
      return matchBankTransaction({
        bankTransactionId: bankTransaction.id,
        match_id: suggestedMatchId,
        type: 'Confirm_Match',
      })
        .then(
          (matchResult) => {
            const transactionsToUpdate: BankTransaction[] = [
              {
                ...bankTransaction,
                categorizationStatus: CategorizationStatus.MATCHED,
                match: matchResult,
                recentlyCategorized: true,
              },
            ]

            if (matchResult.matchType === MatchType.TRANSFER) {
              const matchedTransferBankTransactionId = matchResult.details.id

              const matchedTransferBankTransaction = matchedTransferBankTransactionId
                ? data?.find(({ id }) => id === matchedTransferBankTransactionId)
                : undefined

              if (matchedTransferBankTransaction) {
                transactionsToUpdate.push({
                  ...matchedTransferBankTransaction,
                  categorizationStatus: CategorizationStatus.MATCHED,
                  recentlyCategorized: true,
                })
              }
            }

            updateLocalBankTransactions(transactionsToUpdate)

            eventCallbacks?.onTransactionCategorized?.()

            options?.onSuccess?.()
          },
          () => {
            // Swallow the rejection; `isError`/`isMutating` drive the inline retry UI.
          },
        )
    },
    [matchBankTransaction, updateLocalBankTransactions, data, eventCallbacks],
  )

  return useMemo(
    () => ({ match, isMutating, isError }),
    [match, isMutating, isError],
  )
}
