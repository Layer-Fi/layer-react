import { type PropsWithChildren, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useCategorizationSubmit } from '@hooks/features/bankTransactions/useCategorizationSubmit'
import { useSelectedCategorizationSplitFormError, useSplitsForm } from '@hooks/features/bankTransactions/useSplitsForm'
import { useTaxCodeOptions } from '@hooks/features/bankTransactions/useTaxCodeOptions'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import {
  isSplitSubmitError,
  useBankTransactionsCategorizationActions,
  useGetBankTransactionCategorizationByTransactionId,
  useGetBankTransactionSplitFormErrorVisibility,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
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
    submitError,
    errorMessage: submitErrorMessage,
    isProcessing: isCategorizing,
    isError: isErrorCategorizing,
  } = useCategorizationSubmit({ bankTransaction, notify: true })

  const { selectedCategorization } = useGetBankTransactionCategorizationByTransactionId(bankTransaction.id)
  const { shouldShowSplitFormError } = useGetBankTransactionSplitFormErrorVisibility(bankTransaction.id)
  const { setTransactionSplitFormErrorVisibility } = useBankTransactionsCategorizationActions()
  const selectedSplitFormError = useSelectedCategorizationSplitFormError(
    selectedCategorization,
    shouldShowSplitFormError || isSplitSubmitError(submitError),
  )
  const setVisibleSplitFormError = useCallback((error: string | undefined) => {
    setTransactionSplitFormErrorVisibility(bankTransaction.id, Boolean(error))
  }, [bankTransaction.id, setTransactionSplitFormErrorVisibility])
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
    onBlurSplitField,
  } = useSplitsForm({
    bankTransaction,
    selectedCategorization,
    splitFormError: selectedSplitFormError,
    onSplitFormErrorChange: setVisibleSplitFormError,
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
      submitErrorMessage: isSplitSubmitError(submitError) ? null : submitErrorMessage,
      isCategorizing,
      isErrorCategorizing,
      showRetry,
      localSplits,
      splitFormError,
      addSplit,
      removeSplit,
      updateSplitAmount,
      getInputValueForSplitAtIndex,
      onBlurSplitField,
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
    onBlurSplitField,
    removeSplit,
    showCategorization,
    showDescriptions,
    showReceiptUploads,
    showRetry,
    showTooltips,
    splitFormError,
    submit,
    submitError,
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
