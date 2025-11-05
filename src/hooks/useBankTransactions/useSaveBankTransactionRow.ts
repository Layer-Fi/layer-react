import { BankTransaction } from '../../types/bank_transactions'
import { BankTransactionCategoryComboBoxOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { isPlaceholderAsOption, isSuggestedMatchAsOption, isSplitAsOption } from '../../components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import { useCallback, useMemo } from 'react'
import { useBankTransactionsContext } from '../../contexts/BankTransactionsContext/BankTransactionsContext'
import { CategoryUpdate } from '../../types/categories'
import { ClassificationEncoded } from '../../schemas/categorization'
import { makeTagKeyValueFromTag } from '../../features/tags/tagSchemas'
import { type Split } from '../../types/bank_transactions'
import { SplitAsOption } from '../../types/categorizationOption'

const buildSplitCategorizationRequest = (selectedCategory: SplitAsOption): CategoryUpdate => {
  return {
    type: 'Split',
    entries: selectedCategory.original.map((split: Split) => ({
      category: split.category?.classificationEncoded as ClassificationEncoded,
      amount: split.amount,
      tags: split.tags.map(tag => makeTagKeyValueFromTag(tag)),
      customer_id: split.customerVendor?.customerVendorType === 'CUSTOMER' ? split.customerVendor.id : null,
      vendor_id: split.customerVendor?.customerVendorType === 'VENDOR' ? split.customerVendor.id : null,
    })),
  }
}

type UseSaveBankTransactionRowResult = {
  saveBankTransactionRow: (selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined, bankTransaction: BankTransaction) => Promise<void>
}

export const useSaveBankTransactionRow = (): UseSaveBankTransactionRowResult => {
  const {
    categorize: categorizeBankTransaction,
    match: matchBankTransaction,
  } = useBankTransactionsContext()

  const saveBankTransactionRow = useCallback(async (
    selectedCategory: BankTransactionCategoryComboBoxOption | null | undefined,
    bankTransaction: BankTransaction,
  ) => {
    if (!selectedCategory || isPlaceholderAsOption(selectedCategory)) {
      return
    }

    if (isSuggestedMatchAsOption(selectedCategory)) {
      return matchBankTransaction(bankTransaction.id, selectedCategory.original.id)
    }

    if (isSplitAsOption(selectedCategory)) {
      const splitCategorizationRequest = buildSplitCategorizationRequest(selectedCategory)
      return categorizeBankTransaction(bankTransaction.id, splitCategorizationRequest)
    }

    if (!selectedCategory.classificationEncoded) return

    return categorizeBankTransaction(bankTransaction.id, {
      type: 'Category',
      category: selectedCategory.classificationEncoded,
    })
  }, [categorizeBankTransaction, matchBankTransaction])

  return useMemo(() => ({
    saveBankTransactionRow,
  }), [saveBankTransactionRow])
}
