import { ReceiptsProvider } from '../../providers/ReceiptsProvider'
import { BankTransaction } from '../../types'
import { Purpose } from './BankTransactionMobileListItem'
import { BusinessForm } from './BusinessForm'
import { PersonalForm } from './PersonalForm'
import { SplitAndMatchForm } from './SplitAndMatchForm'
import { MemoTextProvider } from './useMemoText'

interface BankTransactionMobileFormsProps {
  purpose: Purpose
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
  isOpen?: boolean
}

export const BankTransactionMobileForms = ({
  purpose,
  bankTransaction,
  showTooltips,
  showCategorization,
  showReceiptUploads,
  showDescriptions,
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
    <ReceiptsProvider bankTransaction={bankTransaction} isActive={isOpen}>
      <MemoTextProvider bankTransaction={bankTransaction} isActive={isOpen}>
        <div className='Layer__bank-transaction-mobile-list-item__form-container'>
          {getContent()}
        </div>
      </MemoTextProvider>
    </ReceiptsProvider>
  )
}
