import type { BankTransaction } from '@internal-types/bankTransactions'
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

/** Post-success side effects for a single bank transaction update: patch the cached row in place. */
export const useUpdateBankTransactionTriggerSuccess = () => {
  const { debouncedInvalidateProfitAndLoss } = useProfitAndLossGlobalInvalidator()
  const { patchBankTransactionByKey } = useBankTransactionsGlobalCacheActions()

  return (bankTransaction: BankTransaction) => {
    void patchBankTransactionByKey(bankTransaction)

    void debouncedInvalidateProfitAndLoss()
  }
}
