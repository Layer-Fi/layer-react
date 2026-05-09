import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useIntl } from 'react-intl'

import { type BankTransaction, type Split } from '@internal-types/bankTransactions'
import { SplitAsOption } from '@internal-types/categorizationOption'
import { convertCentsToDecimalString } from '@utils/format'
import { toLocalizedNumber } from '@utils/i18n/number/input'
import { useGetBankTransactionCategorizationWithDefault } from '@hooks/features/bankTransactions/useGetBankTransactionCategorizationWithDefault'
import { useBankTransactionsCategorizationActions } from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
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
  isOpen?: boolean
}

export interface UseSplitsFormReturn {
  localSplits: Split[]
  splitFormError: string | undefined
  inputValues: Record<number, string>
  isValid: boolean
  addSplit: () => void
  removeSplit: (index: number) => void
  updateSplitAmount: (index: number) => (value?: string) => void
  changeCategoryForSplitAtIndex: (index: number, category: BankTransactionNonSuggestedMatchOption | null) => void
  updateSplitAtIndex: (index: number, updater: (split: Split) => Split) => void
  onBlurSplitAmount: () => void
  setSplitFormError: (error: string | undefined) => void
  getInputValueForSplitAtIndex: (index: number, split: Split) => string
  validateSplitsForm: () => boolean
  saveLocalSplitsToCategoryStore: (splits: Split[]) => void
}

export const useSplitsForm = ({ bankTransaction, isOpen }: UseSplitsFormOptions): UseSplitsFormReturn => {
  const { t } = useTranslation()
  const intl = useIntl()
  const selectedCategorization = useGetBankTransactionCategorizationWithDefault(bankTransaction)
  const { category: selectedCategory, taxCode: selectedTaxCode } = selectedCategorization

  const prevIsOpenRef = useRef<boolean | undefined>(isOpen)
  const prevBankTransactionRef = useRef<BankTransaction>(bankTransaction)

  const [localSplits, setLocalSplits] = useState<Split[]>(
    getLocalSplitStateForExpandedTransaction(bankTransaction, selectedCategory, selectedTaxCode),
  )

  const [inputValues, setInputValues] = useState<Record<number, string>>({})
  const [splitFormError, setSplitFormError] = useState<string | undefined>()
  const { setTransactionCategorySelection } = useBankTransactionsCategorizationActions()

  const resetLocalSplits = useCallback(() => {
    setLocalSplits(getLocalSplitStateForExpandedTransaction(
      bankTransaction,
      selectedCategory,
      selectedTaxCode,
    ))
    setSplitFormError(undefined)
    setInputValues({})
  }, [bankTransaction, selectedCategory, selectedTaxCode])

  useEffect(() => {
    if (prevBankTransactionRef.current === bankTransaction) return

    resetLocalSplits()

    prevBankTransactionRef.current = bankTransaction
  }, [bankTransaction, resetLocalSplits])

  useEffect(() => {
    if (prevIsOpenRef.current === isOpen) return

    resetLocalSplits()

    prevIsOpenRef.current = isOpen
  }, [isOpen, resetLocalSplits])

  const saveLocalSplitsToCategoryStore = useCallback((splits: Split[]) => {
    if (!isSplitsValid(splits)) {
      setSplitFormError(getSplitsErrorMessage(splits, t))
      return
    }

    setTransactionCategorySelection(bankTransaction.id, new SplitAsOption(splits))
    setSplitFormError(undefined)
  }, [bankTransaction.id, setTransactionCategorySelection, t])

  const addSplit = useCallback(() => {
    const newSplits = calculateAddSplit(localSplits)

    setLocalSplits(newSplits)
    setSplitFormError(undefined)
  }, [localSplits])

  const removeSplit = useCallback((index: number) => {
    const newSplits = calculateRemoveSplit(
      localSplits,
      {
        totalAmount: bankTransaction.amount,
        index,
      })

    setLocalSplits(newSplits)
    setSplitFormError(undefined)
    saveLocalSplitsToCategoryStore(newSplits)
  }, [localSplits, bankTransaction.amount, saveLocalSplitsToCategoryStore])

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
    setSplitFormError(undefined)
    saveLocalSplitsToCategoryStore(newLocalSplits)
  }, [localSplits, bankTransaction.amount, intl.locale, saveLocalSplitsToCategoryStore])

  const changeCategoryForSplitAtIndex = useCallback((index: number, newCategory: BankTransactionNonSuggestedMatchOption | null) => {
    if (newCategory === null) return

    const newLocalSplits = [...localSplits]
    newLocalSplits[index].category = newCategory
    setLocalSplits(newLocalSplits)
    setSplitFormError(undefined)

    saveLocalSplitsToCategoryStore(newLocalSplits)
  }, [localSplits, saveLocalSplitsToCategoryStore])

  const updateSplitAtIndex = useCallback((index: number, updater: (split: Split) => Split) => {
    const newLocalSplits = [...localSplits]
    newLocalSplits[index] = updater(newLocalSplits[index])
    setLocalSplits(newLocalSplits)
    setSplitFormError(undefined)

    saveLocalSplitsToCategoryStore(newLocalSplits)
  }, [localSplits, saveLocalSplitsToCategoryStore])

  const onBlurSplitAmount = useCallback(() => {
    if (!isSplitsValid(localSplits)) {
      setSplitFormError(getSplitsErrorMessage(localSplits, t))
      return
    }
    setSplitFormError(undefined)
    setInputValues({})
  }, [localSplits, t])

  const getInputValueForSplitAtIndex = useCallback((index: number, split: Split): string => {
    return inputValues[index] ?? convertCentsToDecimalString(split.amount)
  }, [inputValues])

  const validateSplitsForm = useCallback((): boolean => {
    if (!isSplitsValid(localSplits)) {
      setSplitFormError(getSplitsErrorMessage(localSplits, t))
      return false
    }
    setSplitFormError(undefined)
    return true
  }, [localSplits, t])

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
    onBlurSplitAmount,
    setSplitFormError,
    getInputValueForSplitAtIndex,
    validateSplitsForm,
    saveLocalSplitsToCategoryStore,
  }
}
