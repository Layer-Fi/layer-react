import { createContext, type RefObject, useContext } from 'react'

import { type BankTransaction } from '@internal-types/bankTransactions'
import { type useSplitsForm } from '@hooks/features/bankTransactions/useSplitsForm'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

type BankTransactionsMobileListSplitFormState = ReturnType<typeof useSplitsForm>

export interface BankTransactionsMobileListSplitFormProps {
  bankTransaction: BankTransaction
  showTooltips: boolean
  showCategorization?: boolean
  showReceiptUploads?: boolean
  showDescriptions?: boolean
}

export interface BankTransactionsMobileListSplitFormContextValue {
  transaction: {
    bankTransaction: BankTransaction
    showTooltips: boolean
    showCategorization: boolean
    showReceiptUploads: boolean
    showDescriptions: boolean
  }
  categorization: {
    submitErrorMessage: string | null | undefined
    isCategorizing: boolean
    isErrorCategorizing: boolean
    showRetry: boolean
    localSplits: BankTransactionsMobileListSplitFormState['localSplits']
    splitFormError: string | undefined
    addSplit: BankTransactionsMobileListSplitFormState['addSplit']
    removeSplit: BankTransactionsMobileListSplitFormState['removeSplit']
    updateSplitAmount: BankTransactionsMobileListSplitFormState['updateSplitAmount']
    getInputValueForSplitAtIndex: BankTransactionsMobileListSplitFormState['getInputValueForSplitAtIndex']
    onBlurSplitAmount: BankTransactionsMobileListSplitFormState['onBlurSplitAmount']
    save: () => void
    handleCategoryChange: (index: number) => (value: BankTransactionCategoryComboBoxOption | null) => void
  }
  taxCodes: {
    hasTaxCodeOptions: boolean
    taxCodeOptions: TaxCodeComboBoxOption[]
    getSelectedTaxCodeOption: (taxCode: string | null) => TaxCodeComboBoxOption | null
    handleTaxCodeChange: (index: number) => (option: TaxCodeComboBoxOption | null) => void
  }
  receipts: {
    receiptsRef: RefObject<BankTransactionReceiptsHandle>
  }
  formatting: {
    formatCurrencyFromCents: (amount: number) => string
  }
}

export const BankTransactionsMobileListSplitFormContext = createContext<BankTransactionsMobileListSplitFormContextValue | null>(null)

export const useBankTransactionsMobileListSplitFormContext = () => {
  const context = useContext(BankTransactionsMobileListSplitFormContext)

  if (!context) {
    throw new Error('useBankTransactionsMobileListSplitFormContext must be used within BankTransactionsMobileListSplitFormProvider')
  }

  return context
}

export type BankTransactionsMobileListSplitFormLocalSplit = BankTransactionsMobileListSplitFormState['localSplits'][number]
