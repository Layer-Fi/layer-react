import type { BankTransaction } from '@internal-types/bankTransactions'
import { isEditableCustomTransaction } from '@utils/bankTransactions/shared'
import { useCustomAccounts } from '@hooks/api/businesses/[business-id]/custom-accounts/useCustomAccounts'

export const useIsEditableCustomTransaction = (bankTransaction: BankTransaction) => {
  const { data: customAccounts } = useCustomAccounts()
  return isEditableCustomTransaction(bankTransaction, customAccounts)
}
