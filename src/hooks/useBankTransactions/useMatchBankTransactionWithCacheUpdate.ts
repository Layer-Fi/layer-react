import { useCallback, useMemo } from 'react'

import { type BankTransaction } from '@internal-types/bank_transactions'
import { CategorizationStatus } from '@schemas/bankTransactions/bankTransaction'
import { MatchType } from '@schemas/bankTransactions/match'
import { useMatchBankTransaction } from '@hooks/useBankTransactions/useMatchBankTransaction'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'
import { useLayerContext } from '@contexts/LayerContext/LayerContext'

export function useMatchBankTransactionWithCacheUpdate() {
  const { addToast, eventCallbacks } = useLayerContext()
  const { mutate: mutateBankTransactions, updateLocalBankTransactions } = useBankTransactionsContext()

  const { trigger: matchBankTransaction, isMutating, isError } = useMatchBankTransaction({
    mutateBankTransactions,
  })

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
            const matchedTransferMatchResult = {
              ...matchResult,
              bank_transaction: bankTransaction,
            }

            transactionsToUpdate.push({
              ...matchResult.bank_transaction,
              categorization_status: CategorizationStatus.MATCHED,
              match: matchedTransferMatchResult,
              recently_categorized: true,
            })
          }

          updateLocalBankTransactions(transactionsToUpdate)

          if (notify) {
            addToast({ content: 'Transaction saved' })
          }
        })
        .finally(() => {
          eventCallbacks?.onTransactionCategorized?.()
        })
    },
    [matchBankTransaction, updateLocalBankTransactions, addToast, eventCallbacks],
  )

  return useMemo(
    () => ({ match, isMutating, isError }),
    [match, isMutating, isError],
  )
}
