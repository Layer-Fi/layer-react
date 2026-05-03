import { BankTransactionFormFields } from '@components/BankTransactionFormFields/BankTransactionFormFields'

import { useBankTransactionsMobileListSplitFormContext } from './BankTransactionsMobileListSplitFormContext'

export const BankTransactionsMobileListSplitFormTransactionFields = () => {
  const {
    transaction: {
      bankTransaction,
      showDescriptions,
    },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <BankTransactionFormFields
      bankTransaction={bankTransaction}
      showDescriptions={showDescriptions}
      hideCustomerVendor
      hideTags
      isMobile
    />
  )
}
