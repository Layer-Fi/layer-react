import { createContext, type PropsWithChildren, useContext, useRef } from 'react'

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

const BankTransactionsFeatureVisibilityContext = createContext<BankTransactionsFeatureVisibility>(
  DEFAULT_FEATURE_VISIBILITY,
)

export function useIsBankTransactionsFeatureEnabled(feature: BankTransactionsFeature) {
  return useContext(BankTransactionsFeatureVisibilityContext)[feature]
}

type BankTransactionsFeatureVisibilityProviderProps = PropsWithChildren<
  Partial<BankTransactionsFeatureVisibility>
>

export function BankTransactionsFeatureVisibilityProvider({
  children,
  ...overrides
}: BankTransactionsFeatureVisibilityProviderProps) {
  const next = resolveFeatureVisibility(overrides)
  const valueRef = useRef(next)

  const hasChanged = Object.values(BankTransactionsFeature)
    .some(feature => valueRef.current[feature] !== next[feature])

  if (hasChanged) {
    valueRef.current = next
  }

  return (
    <BankTransactionsFeatureVisibilityContext.Provider value={valueRef.current}>
      {children}
    </BankTransactionsFeatureVisibilityContext.Provider>
  )
}
