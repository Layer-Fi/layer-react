import { useCallback, useEffect, useState } from 'react'
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
import {
  calculateAddSplit,
  calculateRemoveSplit,
  calculateUpdatedAmounts,
  getLocalSplitStateForExpandedTransaction,
  getSplitsAmountErrorMessage,
  isSplitsValid,
} from '@components/ExpandedBankTransactionRow/utils'

interface UseSplitsFormOptions {
  bankTransaction: BankTransaction
  selectedCategorization: BankTransactionCategorization | undefined
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
}

export const useSplitsForm = ({
  bankTransaction,
  selectedCategorization,
  isOpen,
}: UseSplitsFormOptions): UseSplitsFormReturn => {
  const { t } = useTranslation()
  const intl = useIntl()
  const { formatCurrencyFromCents } = useIntlFormatter()

  const [localSplits, setLocalSplits] = useState<Split[]>(
    getLocalSplitStateForExpandedTransaction(bankTransaction, selectedCategorization),
  )
  const [inputValues, setInputValues] = useState<Record<number, string>>({})
  const [splitFormError, setSplitFormError] = useState<string | undefined>()
  const { setTransactionCategorization } = useBankTransactionsCategorizationActions()

  useEffect(() => {
    setLocalSplits(getLocalSplitStateForExpandedTransaction(bankTransaction, selectedCategorization))
    setSplitFormError(undefined)
    setInputValues({})
  }, [bankTransaction, selectedCategorization, isOpen])

  const persistLocalSplits = useCallback((splits: Split[]) => {
    setTransactionCategorization(bankTransaction.id, { category: new SplitAsOption(splits) })
  }, [bankTransaction.id, setTransactionCategorization])

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
    setSplitFormError(undefined)
    persistLocalSplits(newSplits)
  }, [localSplits, bankTransaction.amount, persistLocalSplits])

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
    persistLocalSplits(newLocalSplits)
  }, [localSplits, bankTransaction.amount, intl.locale, persistLocalSplits])

  const changeCategoryForSplitAtIndex = useCallback((index: number, newCategory: BankTransactionCategoryComboBoxOption | null) => {
    if (newCategory === null) return

    const newLocalSplits = [...localSplits]
    newLocalSplits[index].category = newCategory
    if (isExclusionCategory(newCategory)) {
      newLocalSplits[index].taxCode = null
    }
    setLocalSplits(newLocalSplits)

    persistLocalSplits(newLocalSplits)
  }, [localSplits, persistLocalSplits])

  const updateSplitAtIndex = useCallback((index: number, updater: (split: Split) => Split) => {
    const newLocalSplits = [...localSplits]
    newLocalSplits[index] = updater(newLocalSplits[index])
    setLocalSplits(newLocalSplits)

    persistLocalSplits(newLocalSplits)
  }, [localSplits, persistLocalSplits])

  const onBlurSplitAmount = useCallback(() => {
    const amountError = getSplitsAmountErrorMessage(localSplits, t, formatCurrencyFromCents(0))
    setSplitFormError(amountError)
    if (!amountError) {
      setInputValues({})
    }
  }, [formatCurrencyFromCents, localSplits, t])

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
    onBlurSplitAmount,
    setSplitFormError,
    getInputValueForSplitAtIndex,
  }
}
