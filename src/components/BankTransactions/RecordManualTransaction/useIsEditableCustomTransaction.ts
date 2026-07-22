import type { BankTransaction } from '@internal-types/bankTransactions'
import { isEditableCustomTransaction } from '@utils/bankTransactions/shared'
import { useCustomAccounts } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'
import { useBankTransactionsIsCategorizationEnabledContext } from '@contexts/BankTransactionsIsCategorizationEnabledContext/BankTransactionsIsCategorizationEnabledContext'

export const useIsEditableCustomTransaction = (bankTransaction: BankTransaction) => {
  const isCategorizationEnabled = useBankTransactionsIsCategorizationEnabledContext()
  const showUploadOptions = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.UploadOptions)
  const { data: customAccounts } = useCustomAccounts({ isEnabled: showUploadOptions })
  return isCategorizationEnabled && showUploadOptions && isEditableCustomTransaction(bankTransaction, customAccounts)
}
