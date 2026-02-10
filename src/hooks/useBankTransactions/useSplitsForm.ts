import { useCallback, useEffect, useState } from 'react'

import { type BankTransaction, type Split } from '@internal-types/bank_transactions'
import { SplitAsOption } from '@internal-types/categorizationOption'
import { convertCentsToDecimalString } from '@utils/format'
import { useBankTransactionsCategoryActions } from '@providers/BankTransactionsCategoryStore/BankTransactionsCategoryStoreProvider'
import { type BankTransactionCategoryComboBoxOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
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
  selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined
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
  changeCategoryForSplitAtIndex: (index: number, category: BankTransactionCategoryComboBoxOption | null) => void
  updateSplitAtIndex: (index: number, updater: (split: Split) => Split) => void
  onBlurSplitAmount: () => void
  setSplitFormError: (error: string | undefined) => void
  getInputValueForSplitAtIndex: (index: number, split: Split) => string
  validateSplitsForm: () => boolean
  saveLocalSplitsToCategoryStore: (splits: Split[]) => void
}

export const useSplitsForm = ({
  bankTransaction,
  selectedCategory,
  isOpen,
}: UseSplitsFormOptions): UseSplitsFormReturn => {
  const [localSplits, setLocalSplits] = useState<Split[]>(
    getLocalSplitStateForExpandedTransaction(bankTransaction, selectedCategory),
  )
  const [inputValues, setInputValues] = useState<Record<number, string>>({})
  const [splitFormError, setSplitFormError] = useState<string | undefined>()
  const { setTransactionCategory } = useBankTransactionsCategoryActions()

  useEffect(() => {
    setLocalSplits(getLocalSplitStateForExpandedTransaction(bankTransaction, selectedCategory))
    setSplitFormError(undefined)
    setInputValues({})
  }, [bankTransaction, selectedCategory, isOpen])

  const saveLocalSplitsToCategoryStore = useCallback((splits: Split[]) => {
    if (!isSplitsValid(splits)) {
      setSplitFormError(getSplitsErrorMessage(splits))
      return
    }

    setTransactionCategory(bankTransaction.id, new SplitAsOption(splits))
    setSplitFormError(undefined)
  }, [bankTransaction.id, setTransactionCategory])

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

    if (!value) {
      return
    }

    const trimmedValue = value.endsWith('.') ? value.slice(0, -1) : value
    const numericValue = Number(trimmedValue)

    if (isNaN(numericValue)) {
      return
    }

    const newLocalSplits = calculateUpdatedAmounts(
      localSplits,
      {
        index,
        newAmountInput: trimmedValue,
        totalAmount: bankTransaction.amount,
      })

    setLocalSplits(newLocalSplits)
    setSplitFormError(undefined)
    saveLocalSplitsToCategoryStore(newLocalSplits)
  }, [localSplits, bankTransaction.amount, saveLocalSplitsToCategoryStore])

  const changeCategoryForSplitAtIndex = useCallback((index: number, newCategory: BankTransactionCategoryComboBoxOption | null) => {
    if (newCategory === null) return

    const newLocalSplits = [...localSplits]
    const split = newLocalSplits[index]
    if (!split) return
    split.category = newCategory
    setLocalSplits(newLocalSplits)
    setSplitFormError(undefined)

    saveLocalSplitsToCategoryStore(newLocalSplits)
  }, [localSplits, saveLocalSplitsToCategoryStore])

  const updateSplitAtIndex = useCallback((index: number, updater: (split: Split) => Split) => {
    const newLocalSplits = [...localSplits]
    const split = newLocalSplits[index]
    if (!split) return
    newLocalSplits[index] = updater(split)
    setLocalSplits(newLocalSplits)
    setSplitFormError(undefined)

    saveLocalSplitsToCategoryStore(newLocalSplits)
  }, [localSplits, saveLocalSplitsToCategoryStore])

  const onBlurSplitAmount = useCallback(() => {
    if (!isSplitsValid(localSplits)) {
      setSplitFormError(getSplitsErrorMessage(localSplits))
      return
    }
    setSplitFormError(undefined)
    setInputValues({})
  }, [localSplits])

  const getInputValueForSplitAtIndex = useCallback((index: number, split: Split): string => {
    return inputValues[index] ?? convertCentsToDecimalString(split.amount)
  }, [inputValues])

  const validateSplitsForm = useCallback((): boolean => {
    if (!isSplitsValid(localSplits)) {
      setSplitFormError(getSplitsErrorMessage(localSplits))
      return false
    }
    setSplitFormError(undefined)
    return true
  }, [localSplits])

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
