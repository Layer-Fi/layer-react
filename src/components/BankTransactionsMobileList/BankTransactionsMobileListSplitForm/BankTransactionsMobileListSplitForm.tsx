import { VStack } from '@ui/Stack/Stack'
import { BankTransactionErrorText } from '@components/BankTransactions/BankTransactionErrorText'

import './bankTransactionsMobileListSplitForm.scss'

import { BankTransactionsMobileListSplitFormCategorizationFields } from './BankTransactionsMobileListSplitFormCategorizationFields'
import {
  type BankTransactionsMobileListSplitFormProps,
  useBankTransactionsMobileListSplitFormContext,
} from './BankTransactionsMobileListSplitFormContext'
import { BankTransactionsMobileListSplitFormProvider } from './BankTransactionsMobileListSplitFormProvider'
import { BankTransactionsMobileListSplitFormReceiptSection } from './BankTransactionsMobileListSplitFormReceiptSection'
import { BankTransactionsMobileListSplitFormSubmitActions } from './BankTransactionsMobileListSplitFormSubmitActions'
import { BankTransactionsMobileListSplitFormTransactionFields } from './BankTransactionsMobileListSplitFormTransactionFields'

export const BankTransactionsMobileListSplitForm = (props: BankTransactionsMobileListSplitFormProps) => {
  return (
    <BankTransactionsMobileListSplitFormProvider {...props}>
      <BankTransactionsMobileListSplitFormContent />
    </BankTransactionsMobileListSplitFormProvider>
  )
}

const BankTransactionsMobileListSplitFormContent = () => {
  const {
    transaction: { showCategorization },
    categorization: {
      submitErrorMessage,
      isErrorCategorizing,
      showRetry,
    },
  } = useBankTransactionsMobileListSplitFormContext()

  return (
    <VStack gap='sm'>
      {showCategorization && <BankTransactionsMobileListSplitFormCategorizationFields />}

      <BankTransactionsMobileListSplitFormTransactionFields />
      <BankTransactionsMobileListSplitFormReceiptSection />
      <BankTransactionsMobileListSplitFormSubmitActions />

      <BankTransactionErrorText
        submitErrorMessage={submitErrorMessage}
        showApprovalError={isErrorCategorizing && showRetry}
        layout='inline'
      />
    </VStack>
  )
}
