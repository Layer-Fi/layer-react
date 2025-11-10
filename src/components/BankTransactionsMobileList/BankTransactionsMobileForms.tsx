import { ReceiptsProvider } from '@providers/ReceiptsProvider/ReceiptsProvider'
import { BankTransaction } from '@internal-types/bank_transactions'
import { Purpose } from '@components/BankTransactionsMobileList/BankTransactionsMobileListItem'
import { BusinessForm } from '@components/BankTransactionsMobileList/BusinessForm'
import { PersonalForm } from '@components/BankTransactionsMobileList/PersonalForm'
import { SplitAndMatchForm } from '@components/BankTransactionsMobileList/SplitAndMatchForm'

interface BankTransactionMobileFormsProps {
  isOpen?: boolean
  purpose: Purpose
  bankTransaction: BankTransaction

  showCategorization?: boolean
  showDescriptions: boolean
  showReceiptUploads: boolean
  showTooltips: boolean
}

export const BankTransactionMobileForms = ({
  purpose,
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  isOpen,
}: BankTransactionMobileFormsProps) => {
  const getContent = () => {
    switch (purpose) {
      case Purpose.business:
        return (
          <BusinessForm
            bankTransaction={bankTransaction}
            showCategorization={showCategorization}
            showTooltips={showTooltips}
            showReceiptUploads={showReceiptUploads}
          />
        )
      case Purpose.personal:
        return (
          <PersonalForm
            bankTransaction={bankTransaction}
            showReceiptUploads={showReceiptUploads}
            showCategorization={showCategorization}
          />
        )
      case Purpose.more:
        return (
          <SplitAndMatchForm
            bankTransaction={bankTransaction}
            showCategorization={showCategorization}
            showTooltips={showTooltips}
            showReceiptUploads={showReceiptUploads}
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
