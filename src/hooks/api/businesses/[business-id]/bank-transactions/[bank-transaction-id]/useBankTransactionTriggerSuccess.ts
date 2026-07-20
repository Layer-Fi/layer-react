import { type BankTransaction } from '@internal-types/bankTransactions'
import { useBankTransactionsGlobalCacheActions } from '@hooks/api/businesses/[business-id]/bank-transactions/useBankTransactions'
import { useProfitAndLossGlobalInvalidator } from '@hooks/features/profitAndLoss/useProfitAndLossGlobalInvalidator'
import { useBankTransactionsContext } from '@contexts/BankTransactionsContext/BankTransactionsContext'

/** Shared post-success side effects for single bank transaction categorize/match mutations. */
export const useBankTransactionTriggerSuccess = () => {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { useBankTransactionsOptions } = useBankTransactionsContext()
  const { forceReloadBackgroundBankTransactions } = useBankTransactionsGlobalCacheActions()

  return () => {
    void forceReloadBackgroundBankTransactions(useBankTransactionsOptions)

    void debouncedInvalidateProfitAndLoss()
  }
}

/**
 * Post-success side effects for recording/updating a custom transaction. Patch the returned
 * transaction into the bank-transactions cache by key so edits (memo, counterparty-derived
 * description) stay fresh, and reload so newly created rows appear.
 */
export const useRecordTransactionTriggerSuccess = () => {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { forceReloadBankTransactions, patchBankTransactionByKey } = useBankTransactionsGlobalCacheActions()

  return (bankTransaction: BankTransaction) => {
    void patchBankTransactionByKey(bankTransaction)
    void forceReloadBankTransactions()

    void debouncedInvalidateProfitAndLoss()
  }
}
