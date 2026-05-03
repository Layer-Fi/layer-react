import { type PropsWithChildren, useEffect, useMemo, useRef, useState } from 'react'

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

  const contextValue = useMemo(() => ({
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
      save: () => {
        void submit()
      },
      handleCategoryChange: (index: number) => (value: BankTransactionCategoryComboBoxOption | null) => {
        changeCategoryForSplitAtIndex(index, value)
      },
    },
    taxCodes: {
      hasTaxCodeOptions,
      taxCodeOptions,
      getSelectedTaxCodeOption,
      handleTaxCodeChange: (index: number) => (option: TaxCodeComboBoxOption | null) => {
        updateSplitAtIndex(index, split => ({
          ...split,
          taxCode: option?.value ?? null,
        }))
      },
    },
    receipts: {
      receiptsRef,
    },
    formatting: {
      formatCurrencyFromCents,
    },
  }), [
    addSplit,
    bankTransaction,
    changeCategoryForSplitAtIndex,
    formatCurrencyFromCents,
    getInputValueForSplitAtIndex,
    getSelectedTaxCodeOption,
    hasTaxCodeOptions,
    isCategorizing,
    isErrorCategorizing,
    localSplits,
    onBlurSplitAmount,
    removeSplit,
    showCategorization,
    showDescriptions,
    showReceiptUploads,
    showRetry,
    showTooltips,
    splitFormError,
    submit,
    submitErrorMessage,
    taxCodeOptions,
    updateSplitAmount,
    updateSplitAtIndex,
  ])

  return (
    <BankTransactionsMobileListSplitFormContext.Provider
      value={contextValue}
    >
      {children}
    </BankTransactionsMobileListSplitFormContext.Provider>
  )
}
