import { createContext, type PropsWithChildren, useContext, useMemo, useState } from 'react'
import { createStore, useStore } from 'zustand'

import type { SuggestedMatchAsOption } from '@internal-types/categorizationOption'
import type { BankTransactionNonSuggestedMatchOption } from '@providers/BankTransactionsCategorizationStore/utils'
import { type BankTransactionCategoryComboBoxOption, isSuggestedMatchAsOption } from '@components/BankTransactionCategoryComboBox/bankTransactionCategoryComboBoxOption'
import type { TaxCodeComboBoxOption } from '@components/TaxCodeSelect/taxCodeComboBoxOption'

export enum BankTransactionSelectionVariant {
  MATCH = 'MATCH',
  CATEGORY = 'CATEGORY',
}

export type BankTransactionCategorization = {
  category: BankTransactionNonSuggestedMatchOption | null
  taxCode: TaxCodeComboBoxOption | null

  match: SuggestedMatchAsOption | null

  variant: BankTransactionSelectionVariant
}

export type BankTransactionsCategorizationState = {
  categorizations: Map<string, BankTransactionCategorization>
}

type BankTransactionsCategorizationActions = {
  setTransactionCategorization: (id: string, update: BankTransactionCategoryComboBoxOption | null) => void

  setTransactionCategorySelection: (id: string, category: BankTransactionNonSuggestedMatchOption | null) => void
  setTransactionMatchSelection: (id: string, match: SuggestedMatchAsOption | null) => void
  setTransactionTaxCodeSelection: (id: string, taxCode: TaxCodeComboBoxOption | null) => void
  setTransactionSelectionVariant: (id: string, variant: BankTransactionSelectionVariant) => void

  setOnlyNewTransactionCategorizations: (categorizations: Map<string, BankTransactionCategorization>) => void
  clearTransactionCategorizations: (ids: string[]) => void
}

type BankTransactionsCategorizationStore = BankTransactionsCategorizationState & {
  actions: BankTransactionsCategorizationActions
}

export const DEFAULT_CATEGORIZATION: BankTransactionCategorization = {
  category: null,
  taxCode: null,

  match: null,

  variant: BankTransactionSelectionVariant.CATEGORY,
}

const mergeCategorization = (
  current: BankTransactionCategorization,
  next: Partial<BankTransactionCategorization>,
): BankTransactionCategorization => ({
  category: next.category === undefined ? current.category : next.category,
  taxCode: next.taxCode === undefined ? current.taxCode : next.taxCode,
  match: next.match === undefined ? current.match : next.match,
  variant: next.variant === undefined ? current.variant : next.variant,
})

const updateCategorizationProperty = <K extends keyof BankTransactionCategorization>(
  categorizations: Map<string, BankTransactionCategorization>,
  id: string,
  key: K,
  value: BankTransactionCategorization[K],
) => {
  const current = categorizations.get(id) ?? DEFAULT_CATEGORIZATION
  const merged = { ...current, [key]: value } as BankTransactionCategorization
  const shouldWrite = current[key] !== merged[key]

  if (!shouldWrite) return { categorizations }

  const newMap = new Map(categorizations)
  newMap.set(id, merged)
  return { categorizations: newMap }
}

function buildStore() {
  return createStore<BankTransactionsCategorizationStore>((set) => {
    return {
      categorizations: new Map(),
      actions: {
        setTransactionCategorization: (id, update) => {
          set(({ categorizations }) => {
            if (!update) {
              const { categorizations: categorizationsWithoutMatch } = updateCategorizationProperty(categorizations, id, 'match', null)
              const { categorizations: categorizationsWithoutSelection } = updateCategorizationProperty(categorizationsWithoutMatch, id, 'category', null)
              return updateCategorizationProperty(categorizationsWithoutSelection, id, 'variant', BankTransactionSelectionVariant.CATEGORY)
            }

            const isSuggestedMatch = isSuggestedMatchAsOption(update)
            const { categorizations: nextCategorizations } = updateCategorizationProperty(categorizations, id, isSuggestedMatch ? 'match' : 'category', update)
            return updateCategorizationProperty(nextCategorizations, id, 'variant', isSuggestedMatch ? BankTransactionSelectionVariant.MATCH : BankTransactionSelectionVariant.CATEGORY)
          })
        },

        setTransactionCategorySelection: (id, category) => {
          set(({ categorizations }) => updateCategorizationProperty(categorizations, id, 'category', category))
        },

        setTransactionMatchSelection: (id, match) => {
          set(({ categorizations }) => updateCategorizationProperty(categorizations, id, 'match', match))
        },

        setTransactionTaxCodeSelection: (id, taxCode) => {
          set(({ categorizations }) => updateCategorizationProperty(categorizations, id, 'taxCode', taxCode))
        },

        setTransactionSelectionVariant: (id, variant) => {
          set(({ categorizations }) => updateCategorizationProperty(categorizations, id, 'variant', variant))
        },

        setOnlyNewTransactionCategorizations: (newCategorizations) => {
          set((state) => {
            let hasChanges = false
            const categorizations = state.categorizations
            const newMap = new Map(categorizations)

            newCategorizations.forEach((next, id) => {
              const current = categorizations.get(id)

              if (!current) {
                const merged = mergeCategorization(DEFAULT_CATEGORIZATION, next)

                newMap.set(id, merged)
                hasChanges = true

                return
              }

              const nextUpdates: Partial<BankTransactionCategorization> = {}

              if (current.category === null && next.category) {
                nextUpdates.category = next.category
              }

              if (current.match === null && next.match) {
                nextUpdates.match = next.match
              }

              if (current.taxCode === null && next.taxCode !== null) {
                nextUpdates.taxCode = next.taxCode
              }

              if (Object.keys(nextUpdates).length === 0) return

              const merged = mergeCategorization(current, nextUpdates)
              newMap.set(id, merged)
              hasChanges = true
            })

            return hasChanges ? { categorizations: newMap } : state
          })
        },

        clearTransactionCategorizations: (ids) => {
          set((state) => {
            const newMap = new Map(state.categorizations)
            ids.forEach(id => newMap.delete(id))
            return { categorizations: newMap }
          })
        },

      },
    }
  })
}

const BankTransactionsCategorizationStoreContext = createContext<ReturnType<typeof buildStore> | null>(null)

function useBankTransactionsCategorizationStore() {
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
): BankTransactionCategorization | undefined {
  const store = useBankTransactionsCategorizationStore()
  const selectedCategorization = useStore(store, state => state.categorizations.get(transactionId))

  return selectedCategorization
}

export function useGetAllBankTransactionsCategorizations(): { categorizations: ReadonlyMap<string, BankTransactionCategorization> } {
  const store = useBankTransactionsCategorizationStore()
  const categorizations = useStore(store, state => state.categorizations)

  return useMemo(() => ({ categorizations: new Map(categorizations) }), [categorizations])
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
