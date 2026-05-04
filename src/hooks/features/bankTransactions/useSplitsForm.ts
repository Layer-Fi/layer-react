import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type BankTransaction, type Split } from '@internal-types/bankTransactions'
import { SplitAsOption } from '@internal-types/categorizationOption'
import { isExclusionCategory } from '@utils/bankTransactions/categorization'
import { convertCentsToDecimalString } from '@utils/format'
import { toLocalizedNumber } from '@utils/i18n/number/input'
import { useIntlFormatter } from '@hooks/utils/i18n/useIntlFormatter'
import {
  type BankTransactionCategorization,
  useBankTransactionsCategorizationActions,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import {
  calculateAddSplit,
  calculateRemoveSplit,
  calculateUpdatedAmounts,
  getLocalSplitStateForExpandedTransaction,
  getSplitsErrorMessage,
  isSplitsValid,
} from '@components/ExpandedBankTransactionRow/utils'

interface UseSplitsFormOptions {
  bankTransaction: BankTransaction
  selectedCategorization: BankTransactionCategorization | undefined
  isOpen?: boolean
  splitFormError?: string
  onSplitFormErrorChange?: (error: string | undefined) => void
}

export interface UseSplitsFormReturn {
  localSplits: Split[]
  splitFormError: string | undefined
  inputValues: Record<number, string>
  isValid: boolean
  addSplit: () => void
  removeSplit: (index: number) => void
  updateSplitAmount: (index: number) => (value?: string) => void
  changeCategoryForSplitAtIndex: (index: number, category: BankTransactionCategoryComboBoxOption | null) => void
  updateSplitAtIndex: (index: number, updater: (split: Split) => Split) => void
  onBlurSplitField: () => void
  setSplitFormError: (error: string | undefined) => void
  getInputValueForSplitAtIndex: (index: number, split: Split) => string
}

export const useSplitsForm = ({
  bankTransaction,
  selectedCategorization,
  isOpen,
  splitFormError: controlledSplitFormError,
  onSplitFormErrorChange,
}: UseSplitsFormOptions): UseSplitsFormReturn => {
  const { t } = useTranslation()
  const intl = useIntl()
  const { formatCurrencyFromCents } = useIntlFormatter()

  const [localSplits, setLocalSplits] = useState<Split[]>(
    getLocalSplitStateForExpandedTransaction(bankTransaction, selectedCategorization),
  )
  const [inputValues, setInputValues] = useState<Record<number, string>>({})
  const [internalSplitFormError, setInternalSplitFormError] = useState<string | undefined>()
  const previousFormKeyRef = useRef({ transactionId: bankTransaction.id, isOpen })
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()
  const splitFormError = onSplitFormErrorChange ? controlledSplitFormError : internalSplitFormError
  const setSplitFormError = onSplitFormErrorChange ?? setInternalSplitFormError

  useEffect(() => {
    const nextSplits = getLocalSplitStateForExpandedTransaction(bankTransaction, selectedCategorization)
    const isFormReset = previousFormKeyRef.current.transactionId !== bankTransaction.id

    previousFormKeyRef.current = { transactionId: bankTransaction.id, isOpen }
    setLocalSplits(nextSplits)
    setSplitFormError(
      isFormReset || !splitFormError || isSplitsValid(nextSplits)
        ? undefined
        : getSplitsErrorMessage(nextSplits, t, formatCurrencyFromCents(0)) || undefined,
    )
    setInputValues({})
  }, [bankTransaction, selectedCategorization, isOpen, setSplitFormError, splitFormError, t, formatCurrencyFromCents])

  const persistLocalSplits = useCallback((splits: Split[]) => {
    setTransactionCategorization(bankTransaction.id, { category: new SplitAsOption(splits) })
  }, [bankTransaction.id, setTransactionCategorization])

  const updateSplitFormError = useCallback((splits: Split[]) => {
    const error = getSplitsErrorMessage(splits, t, formatCurrencyFromCents(0))
    setSplitFormError(error || undefined)
    return error
  }, [formatCurrencyFromCents, setSplitFormError, t])

  const clearSplitFormErrorIfValid = useCallback((splits: Split[]) => {
    if (splitFormError && isSplitsValid(splits)) {
      setSplitFormError(undefined)
    }
  }, [setSplitFormError, splitFormError])

  const addSplit = useCallback(() => {
    const newSplits = calculateAddSplit(localSplits)
    setLocalSplits(newSplits)
    persistLocalSplits(newSplits)
  }, [localSplits, persistLocalSplits])

  const removeSplit = useCallback((index: number) => {
    const newSplits = calculateRemoveSplit(
      localSplits,
      {
        totalAmount: bankTransaction.amount,
        index,
      })

    setLocalSplits(newSplits)
    clearSplitFormErrorIfValid(newSplits)
    persistLocalSplits(newSplits)
  }, [localSplits, bankTransaction.amount, clearSplitFormErrorIfValid, persistLocalSplits])

  const updateSplitAmount = useCallback((index: number) => (value?: string) => {
    setInputValues(prev => ({ ...prev, [index]: value ?? '' }))

    if (!value) return

    const numericValue = toLocalizedNumber(value, intl.locale)

    if (numericValue === undefined) return

    const newLocalSplits = calculateUpdatedAmounts(
      localSplits,
      { index, newAmountInput: value, totalAmount: bankTransaction.amount, locale: intl.locale },
    )

    setLocalSplits(newLocalSplits)
    clearSplitFormErrorIfValid(newLocalSplits)
    persistLocalSplits(newLocalSplits)
  }, [localSplits, bankTransaction.amount, clearSplitFormErrorIfValid, intl.locale, persistLocalSplits])

  const changeCategoryForSplitAtIndex = useCallback((index: number, newCategory: BankTransactionCategoryComboBoxOption | null) => {
    if (newCategory === null) return

    const newLocalSplits = [...localSplits]
    newLocalSplits[index].category = newCategory
    if (isExclusionCategory(newCategory)) {
      newLocalSplits[index].taxCode = null
    }
    setLocalSplits(newLocalSplits)
    clearSplitFormErrorIfValid(newLocalSplits)

    persistLocalSplits(newLocalSplits)
  }, [clearSplitFormErrorIfValid, localSplits, persistLocalSplits])

  const updateSplitAtIndex = useCallback((index: number, updater: (split: Split) => Split) => {
    const newLocalSplits = [...localSplits]
    newLocalSplits[index] = updater(newLocalSplits[index])
    setLocalSplits(newLocalSplits)

    persistLocalSplits(newLocalSplits)
  }, [localSplits, persistLocalSplits])

  const onBlurSplitField = useCallback(() => {
    const error = updateSplitFormError(localSplits)
    if (!error) {
      setInputValues({})
    }
  }, [localSplits, updateSplitFormError])

  const getInputValueForSplitAtIndex = useCallback((index: number, split: Split): string => {
    return inputValues[index] ?? convertCentsToDecimalString(split.amount)
  }, [inputValues])

  return {
    localSplits,
    splitFormError,
    inputValues,
    isValid: isSplitsValid(localSplits),
    addSplit,
    removeSplit,
    updateSplitAmount,
    changeCategoryForSplitAtIndex,
    updateSplitAtIndex,
    onBlurSplitField,
    setSplitFormError,
    getInputValueForSplitAtIndex,
  }
}

export const useSelectedCategorizationSplitFormError = (
  selectedCategorization: BankTransactionCategorization | undefined,
  shouldShowError: boolean,
): string | undefined => {
  const { t } = useTranslation()
  const { formatCurrencyFromCents } = useIntlFormatter()
  const selectedCategory = selectedCategorization?.category

  if (!shouldShowError || !selectedCategory || !isSplitAsOption(selectedCategory)) {
    return undefined
  }

  return getSplitsErrorMessage(selectedCategory.original, t, formatCurrencyFromCents(0)) || undefined
}
