import { useMemo } from 'react'

import {
  type TaxCodeSelectOption,
  useBankTransactionsCategorizationActions,
  useGetBankTransactionCategorization,
} from '@providers/BankTransactionsCategorizationStore/BankTransactionsCategorizationStoreProvider'

type BankTransactionsTaxCodeActions = {
  setTransactionTaxCode: (id: string, taxCode: TaxCodeSelectOption | null) => void
  clearTransactionTaxCode: (id: string) => void
  clearMultipleTransactionTaxCodes: (ids: string[]) => void
  clearAllTransactionTaxCodes: () => void
}

export function useBankTransactionsTaxCodeActions(): BankTransactionsTaxCodeActions {
  const {
    setTransactionCategorization,
    clearAllTransactionTaxCodes,
  } = useBankTransactionsCategorizationActions()

  return useMemo(() => ({
    setTransactionTaxCode: (id, taxCode) => {
      setTransactionCategorization(id, { taxCode })
    },
    clearTransactionTaxCode: (id) => {
      setTransactionCategorization(id, { taxCode: null })
    },
    clearMultipleTransactionTaxCodes: (ids) => {
      ids.forEach((id) => {
        setTransactionCategorization(id, { taxCode: null })
      })
    },
    clearAllTransactionTaxCodes,
  }), [
    clearAllTransactionTaxCodes,
    setTransactionCategorization,
  ])
}

export function useGetBankTransactionTaxCode(transactionId: string): {
  selectedTaxCode: TaxCodeSelectOption | null
  hasSelectedTaxCode: boolean
} {
  const { selectedCategorization } = useGetBankTransactionCategorization(transactionId)

  return {
    selectedTaxCode: selectedCategorization?.taxCode ?? null,
    hasSelectedTaxCode: selectedCategorization !== undefined,
  }
}

export function useGetBankTransactionSessionTaxCodes(transactionId: string): {
  sessionTaxCodes: TaxCodeSelectOption[]
} {
  const { selectedTaxCode, hasSelectedTaxCode } = useGetBankTransactionTaxCode(transactionId)

  return {
    sessionTaxCodes: hasSelectedTaxCode && selectedTaxCode ? [selectedTaxCode] : [],
  }
}
