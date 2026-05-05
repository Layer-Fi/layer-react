import { createContext, type PropsWithChildren, useContext, useState } from 'react'
import type { TFunction } from 'i18next'
import { createStore, useStore } from 'zustand'

import type { Split } from '@internal-types/bankTransactions'
import { type BankTransactionCategoryComboBoxOption, isPlaceholderAsOption, isSplitAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

export type BankTransactionCategorization = {
  category: BankTransactionCategoryComboBoxOption | null
  taxCode: TaxCodeComboBoxOption | null
}

type BankTransactionCategorizationUpdate =
  | Pick<BankTransactionCategorization, 'category'>
  | Pick<BankTransactionCategorization, 'taxCode'>
  | BankTransactionCategorization

export type BankTransactionsCategorizationState = {
  categorizations: Map<string, BankTransactionCategorization>
  splitFormErrorTransactionIds: Set<string>
}

type BankTransactionsCategorizationActions = {
  setTransactionCategorization: (
    id: string,
    categorization: BankTransactionCategorizationUpdate,
  ) => void
  setOnlyNewTransactionCategorizations: (
    categorizations: Map<string, BankTransactionCategorization>
  ) => void
  clearTransactionCategorizations: (ids: string[]) => void
  clearAllTransactionCategorizations: () => void
  setTransactionSplitFormErrorVisibility: (id: string, visible: boolean) => void
}

type BankTransactionsCategorizationStore = BankTransactionsCategorizationState & {
  actions: BankTransactionsCategorizationActions
}

function normalizeCategorization(
  currentCategorization: BankTransactionCategorization | undefined,
  nextCategorization: BankTransactionCategorizationUpdate,
): BankTransactionCategorization {
  const mergedCategorization: BankTransactionCategorization = currentCategorization
    ? { ...currentCategorization }
    : { category: null, taxCode: null }

  if ('category' in nextCategorization) {
    mergedCategorization.category = nextCategorization.category
  }

  if ('taxCode' in nextCategorization) {
    mergedCategorization.taxCode = nextCategorization.taxCode
  }

  return mergedCategorization
}

function buildStore() {
  return createStore<BankTransactionsCategorizationStore>(set => ({
    categorizations: new Map<string, BankTransactionCategorization>(),
    splitFormErrorTransactionIds: new Set<string>(),
    actions: {
      setTransactionCategorization: (id: string, categorization: BankTransactionCategorizationUpdate): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          const nextCategorization = normalizeCategorization(newMap.get(id), categorization)

          newMap.set(id, nextCategorization)

          return { categorizations: newMap }
        })
      },

      setOnlyNewTransactionCategorizations: (categorizations: Map<string, BankTransactionCategorization>): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          let hasChanges = false

          categorizations.forEach((newCategorization, id) => {
            const currCategorization = newMap.get(id)

            if (currCategorization === undefined) {
              newMap.set(id, normalizeCategorization(undefined, newCategorization))
              hasChanges = true
              return
            }

            const applyCategorization = currCategorization.category === null && newCategorization.category !== null

            if (applyCategorization) {
              newMap.set(id, normalizeCategorization(currCategorization, newCategorization))
              hasChanges = true
            }
          })

          return hasChanges ? { categorizations: newMap } : state
        })
      },

      clearTransactionCategorizations: (ids: string[]): void => {
        set((state) => {
          const newMap = new Map(state.categorizations)
          const newSplitFormErrorTransactionIds = new Set(state.splitFormErrorTransactionIds)
          ids.forEach(id => newMap.delete(id))
          ids.forEach(id => newSplitFormErrorTransactionIds.delete(id))
          return {
            categorizations: newMap,
            splitFormErrorTransactionIds: newSplitFormErrorTransactionIds,
          }
        })
      },

      clearAllTransactionCategorizations: () => {
        set({
          categorizations: new Map<string, BankTransactionCategorization>(),
          splitFormErrorTransactionIds: new Set<string>(),
        })
      },

      setTransactionSplitFormErrorVisibility: (id: string, visible: boolean): void => {
        set((state) => {
          if (state.splitFormErrorTransactionIds.has(id) === visible) {
            return state
          }

          const newSplitFormErrorTransactionIds = new Set(state.splitFormErrorTransactionIds)

          if (visible) {
            newSplitFormErrorTransactionIds.add(id)
          }
          else {
            newSplitFormErrorTransactionIds.delete(id)
          }

          return { splitFormErrorTransactionIds: newSplitFormErrorTransactionIds }
        })
      },
    },
  }))
}

const BankTransactionsCategorizationStoreContext = createContext<ReturnType<typeof buildStore> | null>(null)

function useBankTransactionsCategorizationStore(): ReturnType<typeof buildStore> {
  const store = useContext(BankTransactionsCategorizationStoreContext)

  if (!store) {
    throw new Error('useBankTransactionsCategorizationStore must be used within BankTransactionsCategorizationStoreProvider')
  }

  return store
}

export function useBankTransactionsCategorizationActions(): BankTransactionsCategorizationActions {
  const store = useBankTransactionsCategorizationStore()

  return useStore(store, state => state.actions)
}

export function useGetBankTransactionCategorizationByTransactionId(
  transactionId: string,
): { selectedCategorization: BankTransactionCategorization | undefined } {
  const store = useBankTransactionsCategorizationStore()

  const selectedCategorization = useStore(store, state => state.categorizations.get(transactionId))

  return { selectedCategorization }
}

export function useGetBankTransactionSplitFormErrorVisibility(
  transactionId: string,
): { shouldShowSplitFormError: boolean } {
  const store = useBankTransactionsCategorizationStore()

  const shouldShowSplitFormError = useStore(store, state => state.splitFormErrorTransactionIds.has(transactionId))

  return { shouldShowSplitFormError }
}

export type TransactionCategorizationSubmitError = 'category_required'

export type SplitTransactionCategorizationSubmitError =
  | 'split_category_required'
  | 'split_amount_invalid'

export type BankTransactionSplitError = 'SplitError'

export type CategorizationSubmitError =
  | TransactionCategorizationSubmitError
  | SplitTransactionCategorizationSubmitError

export function isSplitSubmitError(
  error: CategorizationSubmitError | null | undefined,
): error is SplitTransactionCategorizationSubmitError {
  return error === 'split_category_required' || error === 'split_amount_invalid'
}

export function isBankTransactionSplitError(
  error: string | null | undefined,
): error is BankTransactionSplitError {
  return error === 'SplitError'
}

export type CategorizedBankTransactionCategorization = BankTransactionCategorization & {
  category: BankTransactionCategoryComboBoxOption
}

export type CategorizationValidationResult =
  | { ok: true, value: CategorizedBankTransactionCategorization }
  | { ok: false, error: TransactionCategorizationSubmitError }

export function validateCategorizationForSubmit(
  categorization: BankTransactionCategorization | undefined,
): CategorizationValidationResult {
  if (!categorization?.category || isPlaceholderAsOption(categorization.category)) {
    return { ok: false, error: 'category_required' }
  }
  return { ok: true, value: { category: categorization.category, taxCode: categorization.taxCode } }
}

export type SplitCategorizationValidationResult =
  | { ok: true }
  | { ok: false, error: SplitTransactionCategorizationSubmitError }

export function validateSplitCategorizationForSubmit(
  splits: ReadonlyArray<Split>,
): SplitCategorizationValidationResult {
  for (const split of splits) {
    if (split.amount <= 0) {
      return { ok: false, error: 'split_amount_invalid' }
    }
    if (!split.category) {
      return { ok: false, error: 'split_category_required' }
    }
  }
  return { ok: true }
}

export type AnyCategorizationValidationResult =
  | { ok: true, value: CategorizedBankTransactionCategorization }
  | { ok: false, error: CategorizationSubmitError }

export function validateBankTransactionCategorizationForSubmit(
  categorization: BankTransactionCategorization | undefined,
): AnyCategorizationValidationResult {
  const result = validateCategorizationForSubmit(categorization)

  if (!result.ok) {
    return result
  }

  if (isSplitAsOption(result.value.category)) {
    const splitResult = validateSplitCategorizationForSubmit(result.value.category.original)

    if (!splitResult.ok) {
      return splitResult
    }
  }

  return result
}

export function getTransactionCategorizationSubmitErrorMessage(
  t: TFunction,
  error: CategorizationSubmitError,
  zeroAmount: string,
): string {
  switch (error) {
    case 'category_required':
      return t('bankTransactions:error.category_required', 'Select a category before saving')
    case 'split_category_required':
      return t('bankTransactions:validation.splits_must_have_category', 'All splits must have a category')
    case 'split_amount_invalid':
      return t('bankTransactions:validation.splits_amount_greater_than_zero', 'All splits must have an amount greater than {{amount}}', { amount: zeroAmount })
  }
}

export function useGetAllBankTransactionsCategorizations(): { categorizations: Map<string, BankTransactionCategorization> } {
  const store = useBankTransactionsCategorizationStore()

  const categorizations = useStore(store, state => state.categorizations)

  return { categorizations }
}

type BankTransactionsCategorizationStoreProviderProps = PropsWithChildren

export function BankTransactionsCategorizationStoreProvider({
  children,
}: BankTransactionsCategorizationStoreProviderProps): JSX.Element {
  const [store] = useState(() => buildStore())
  return (
    <BankTransactionsCategorizationStoreContext.Provider value={store}>
      {children}
    </BankTransactionsCategorizationStoreContext.Provider>
  )
}
