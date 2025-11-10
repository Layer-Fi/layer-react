import { ReceiptsProvider } from '@providers/ReceiptsProvider/ReceiptsProvider'
import { BankTransaction } from '@internal-types/bank_transactions'
import { Purpose } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItem'
import { BankTransactionsMobileListBusinessForm } from '@components/BankTransactionsMobileList/BankTransactionsMobileListBusinessForm'
import { BankTransactionsMobileListPersonalForm } from '@components/BankTransactionsMobileList/BankTransactionsMobileListPersonalForm'
import { BankTransactionsMobileListSplitAndMatchForm } from '@components/BankTransactionsMobileList/BankTransactionsMobileListSplitAndMatchForm'

interface BankTransactionsMobileFormsProps {
  isOpen?: boolean
  purpose: Purpose
  bankTransaction: BankTransaction

  showCategorization?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionsMobileForms = ({
  purpose,
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  showDescriptions,
  isOpen,
}: BankTransactionsMobileFormsProps) => {
  const getContent = () => {
    switch (purpose) {
      case Purpose.business:
        return (
          <BankTransactionsMobileListBusinessForm
            bankTransaction={bankTransaction}
            showCategorization={showCategorization}
            showTooltips={showTooltips}
            showReceiptUploads={showReceiptUploads}
            showDescriptions={showDescriptions}
          />
        )
      case Purpose.personal:
        return (
          <BankTransactionsMobileListPersonalForm
            bankTransaction={bankTransaction}
            showReceiptUploads={showReceiptUploads}
            showDescriptions={showDescriptions}
            showCategorization={showCategorization}
          />
        )
      case Purpose.more:
        return (
          <BankTransactionsMobileListSplitAndMatchForm
            bankTransaction={bankTransaction}
            showCategorization={showCategorization}
            showTooltips={showTooltips}
            showReceiptUploads={showReceiptUploads}
            showDescriptions={showDescriptions}
          />
        )
      default:
        return null
    }
  }

  return (
    <ReceiptsProvider bankTransaction={bankTransaction} isActive={isOpen}>
      <div className='Layer__bank-transaction-mobile-list-item__form-container'>
        {getContent()}
      </div>
    </ReceiptsProvider>
  )
}
