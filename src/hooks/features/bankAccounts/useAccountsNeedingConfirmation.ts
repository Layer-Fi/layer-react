import { useMemo } from 'react'

import { getAccountsNeedingConfirmation } from '@utils/features/bankAccounts/bankAccount'
import { useBankAccountsContext } from '@providers/features/bankAccounts/BankAccountsContext/BankAccountsContext'

export const useAccountsNeedingConfirmation = () => {
  const { data } = useBankAccountsContext()

  return useMemo(() => getAccountsNeedingConfirmation(data ?? []), [data])
}
