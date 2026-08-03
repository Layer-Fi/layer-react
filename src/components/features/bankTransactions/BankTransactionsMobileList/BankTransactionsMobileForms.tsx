import { type BankTransaction } from '@internal-types/bankTransactions'
import { ReceiptsProvider } from '@providers/ReceiptsProvider/ReceiptsProvider'
import { BankTransactionsMobileListBusinessForm } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileListBusinessForm'
import { BankTransactionsMobileListPersonalForm } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileListPersonalForm'
import { BankTransactionsMobileListSplitAndMatchForm } from '@features/bankTransactions/BankTransactionsMobileList/BankTransactionsMobileListSplitAndMatchForm'
import { Purpose } from '@features/bankTransactions/BankTransactionsMobileList/purpose'

interface BankTransactionsMobileFormsProps {
  isOpen?: boolean
  purpose: Purpose
  bankTransaction: BankTransaction

  showCategorization?: boolean
}

export const BankTransactionsMobileForms = ({
  purpose,
  bankTransaction,
  showCategorization,
  isOpen,
}: BankTransactionsMobileFormsProps) => {
  const getContent = () => {
    switch (purpose) {
      case Purpose.business:
        return (
          <BankTransactionsMobileListBusinessForm
            bankTransaction={bankTransaction}
            showCategorization={showCategorization}
          />
        )
      case Purpose.personal:
        return (
          <BankTransactionsMobileListPersonalForm
            bankTransaction={bankTransaction}
            showCategorization={showCategorization}
          />
        )
      case Purpose.more:
        return (
          <BankTransactionsMobileListSplitAndMatchForm
            bankTransaction={bankTransaction}
            showCategorization={showCategorization}
          />
        )
      default:
        return null
    }
  }

  return (
    <ReceiptsProvider bankTransaction={bankTransaction} isActive={isOpen}>
      {getContent()}
    </ReceiptsProvider>
  )
}
