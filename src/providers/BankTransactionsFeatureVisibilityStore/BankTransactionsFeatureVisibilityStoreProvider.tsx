import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react'
import { createStore, useStore } from 'zustand'
import { shallow } from 'zustand/shallow'

export enum BankTransactionsFeature {
  CategorizationRules = 'showCategorizationRules',
  CustomerVendor = 'showCustomerVendor',
  Descriptions = 'showDescriptions',
  ReceiptUploads = 'showReceiptUploads',
  StatusToggle = 'showStatusToggle',
  Tags = 'showTags',
  Tooltips = 'showTooltips',
  UploadOptions = 'showUploadOptions',
}

type BankTransactionsFeatureVisibility = Record<BankTransactionsFeature, boolean>

const DEFAULT_FEATURE_VISIBILITY: BankTransactionsFeatureVisibility = {
  [BankTransactionsFeature.CategorizationRules]: false,
  [BankTransactionsFeature.CustomerVendor]: false,
  [BankTransactionsFeature.Descriptions]: true,
  [BankTransactionsFeature.ReceiptUploads]: true,
  [BankTransactionsFeature.StatusToggle]: true,
  [BankTransactionsFeature.Tags]: false,
  [BankTransactionsFeature.Tooltips]: false,
  [BankTransactionsFeature.UploadOptions]: false,
}

function resolveFeatureVisibility(
  overrides: Partial<BankTransactionsFeatureVisibility>,
): BankTransactionsFeatureVisibility {
  const resolved = { ...DEFAULT_FEATURE_VISIBILITY }

  for (const feature of Object.values(BankTransactionsFeature)) {
    const value = overrides[feature]
    if (value !== undefined) {
      resolved[feature] = value
    }
  }

  return resolved
}

const BankTransactionsFeatureVisibilityStoreContext = createContext(
  createStore<BankTransactionsFeatureVisibility>(() => DEFAULT_FEATURE_VISIBILITY),
)

export function useIsBankTransactionsFeatureEnabled(feature: BankTransactionsFeature) {
  const store = useContext(BankTransactionsFeatureVisibilityStoreContext)
  return useStore(store, state => state[feature])
}

type BankTransactionsFeatureVisibilityStoreProviderProps = PropsWithChildren<
  Partial<BankTransactionsFeatureVisibility>
>

export function BankTransactionsFeatureVisibilityStoreProvider({
  children,
  ...overrides
}: BankTransactionsFeatureVisibilityStoreProviderProps) {
  const [store] = useState(() =>
    createStore<BankTransactionsFeatureVisibility>(() => resolveFeatureVisibility(overrides)),
  )

  useEffect(() => {
    store.setState((prev) => {
      const next = resolveFeatureVisibility(overrides)

      return shallow(prev, next) ? prev : next
    })
  }, [store, overrides])

  return (
    <BankTransactionsFeatureVisibilityStoreContext.Provider value={store}>
      {children}
    </BankTransactionsFeatureVisibilityStoreContext.Provider>
  )
}
