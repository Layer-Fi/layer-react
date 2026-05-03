import { type PropsWithChildren, useEffect, useRef, useState } from 'react'

import { useCategorizationSubmit } from '@hooks/features/bankTransactions/useCategorizationSubmit'
import { useSplitsForm } from '@hooks/features/bankTransactions/useSplitsForm'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import { useGetBankTransactionCategorizationByTransactionId } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { type BankTransactionReceiptsHandle } from '@components/BankTransactionReceipts/BankTransactionReceipts'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

import {
  BankTransactionsMobileListSplitFormContext,
  type BankTransactionsMobileListSplitFormProps,
} from './BankTransactionsMobileListSplitFormContext'

export const BankTransactionsMobileListSplitFormProvider = ({
  bankTransaction,
  showTooltips,
  showCategorization = false,
  showReceiptUploads = false,
  showDescriptions = false,
  children,
}: PropsWithChildren<BankTransactionsMobileListSplitFormProps>) => {
  const { formatCurrencyFromCents } = useIntlFormatter()
  const receiptsRef = useRef<BankTransactionReceiptsHandle>(null)

  const {
    submit,
    errorMessage: submitErrorMessage,
    isProcessing: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizationSubmit({ bankTransaction, notify: true })

  const { selectedCategorization } = useGetBankTransactionCategorizationByTransactionId(bankTransaction.id)
  const [showRetry, setShowRetry] = useState(false)

  const {
    localSplits,
    splitFormError,
    addSplit,
    removeSplit,
    updateSplitAmount,
    changeCategoryForSplitAtIndex,
    updateSplitAtIndex,
    getInputValueForSplitAtIndex,
    onBlurSplitAmount,
  } = useSplitsForm({
    bankTransaction,
    selectedCategorization,
  })

  const { taxCodeOptions, hasTaxCodeOptions, getSelectedTaxCodeOption } = useTaxCodeOptions(bankTransaction)

  useEffect(() => {
    if (isErrorCategorizing) {
      setShowRetry(true)
    }
  }, [isErrorCategorizing])

  const save = () => {
    void submit()
  }

  const handleCategoryChange = (index: number) => (value: BankTransactionCategoryComboBoxOption | null) => {
    changeCategoryForSplitAtIndex(index, value)
  }

  const handleTaxCodeChange = (index: number) => (option: TaxCodeComboBoxOption | null) => {
    updateSplitAtIndex(index, split => ({
      ...split,
      taxCode: option?.value ?? null,
    }))
  }

  return (
    <BankTransactionsMobileListSplitFormContext.Provider
      value={{
        transaction: {
          bankTransaction,
          showTooltips,
          showCategorization,
          showReceiptUploads,
          showDescriptions,
        },
        categorization: {
          submitErrorMessage,
          isCategorizing,
          isErrorCategorizing,
          showRetry,
          localSplits,
          splitFormError,
          addSplit,
          removeSplit,
          updateSplitAmount,
          getInputValueForSplitAtIndex,
          onBlurSplitAmount,
          save,
          handleCategoryChange,
        },
        taxCodes: {
          hasTaxCodeOptions,
          taxCodeOptions,
          getSelectedTaxCodeOption,
          handleTaxCodeChange,
        },
        receipts: {
          receiptsRef,
        },
        formatting: {
          formatCurrencyFromCents,
        },
      }}
    >
      {children}
    </BankTransactionsMobileListSplitFormContext.Provider>
  )
}
