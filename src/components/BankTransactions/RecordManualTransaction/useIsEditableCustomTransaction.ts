import type { BankTransaction } from '@internal-types/bankTransactions'
import { isEditableCustomTransaction } from '@utils/bankTransactions/shared'
import { useGetCustomAccounts } from '@api/businesses/[business-id]/custom-accounts/get'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'

export const useIsEditableCustomTransaction = (bankTransaction: BankTransaction) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const showUploadOptions = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.UploadOptions)
  const { data: customAccounts } = useGetCustomAccounts({ isEnabled: showUploadOptions })
  return isCategorizationEnabled && showUploadOptions && isEditableCustomTransaction(bankTransaction, customAccounts)
}
