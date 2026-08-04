import type { BankTransaction } from '@internal-types/bankTransactions'
import { isEditableCustomTransaction } from '@utils/bankTransactions/shared'
import { useGetCustomAccounts } from '@api/businesses/[business-id]/custom-accounts/get'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/bankTransactions/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@providers/categorization/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'

export const useIsEditableCustomBankTransaction = (bankTransaction: BankTransaction) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const showUploadOptions = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.UploadOptions)
  const { data: customAccounts } = useGetCustomAccounts({ isEnabled: showUploadOptions })
  return isCategorizationEnabled && showUploadOptions && isEditableCustomTransaction(bankTransaction, customAccounts)
}
