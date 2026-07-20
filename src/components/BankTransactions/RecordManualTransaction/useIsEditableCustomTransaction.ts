import type { BankTransaction } from '@internal-types/bankTransactions'
import { isEditableCustomTransaction } from '@utils/bankTransactions/shared'
import { useCustomAccounts } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'
import { BankTransactionsFeature, useIsBankTransactionsFeatureEnabled } from '@providers/BankTransactionsFeatureVisibility/BankTransactionsFeatureVisibilityProvider'

export const useIsEditableCustomTransaction = (bankTransaction: BankTransaction) => {
  const showUploadOptions = useIsBankTransactionsFeatureEnabled(BankTransactionsFeature.UploadOptions)
  const { data: customAccounts } = useCustomAccounts({ isEnabled: showUploadOptions })
  return showUploadOptions && isEditableCustomTransaction(bankTransaction, customAccounts)
}
