import { BankTransaction } from '../../types'
import { Purpose } from './BankTransactionMobileListItem'
import { BusinessForm } from './BusinessForm'
import { PersonalForm } from './PersonalForm'
import { SplitAndMatchForm } from './SplitAndMatchForm'

interface BankTransactionMobileFormsProps {
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
  showDescriptions,
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
            showDescriptions={showDescriptions}
          />
        )
      case Purpose.personal:
        return (
          <PersonalForm
            bankTransaction={bankTransaction}
            showReceiptUploads={showReceiptUploads}
            showDescriptions={showDescriptions}
          />
        )
      case Purpose.more:
        return (
          <SplitAndMatchForm
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
    <div className='Layer__bank-transaction-mobile-list-item__form-container'>
      {getContent()}
    </div>

  )
}
