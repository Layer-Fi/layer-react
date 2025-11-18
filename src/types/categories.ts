import { type AccountIdentifier, AccountIdEquivalence, AccountStableNameEquivalence, makeAccountId, makeStableName } from '@schemas/accountIdentifier'
import { type CategorizationEncoded as ApiCategorization, type ClassificationEncoded, type NestedCategorization } from '@schemas/categorization'

export enum CategorizationType {
  AUTO = 'AUTO',
  ASK_FROM_SUGGESTIONS = 'ASK_FROM_SUGGESTIONS',
  MEALS = 'MEALS',
  BUSINESS_TRAVEL_TRANSPORTATION = 'BUSINESS_TRAVEL_TRANSPORTATION',
}

export interface AutoCategorization {
  type: CategorizationType.AUTO
  category: ApiCategorization
}
export interface SuggestedCategorization {
  type: CategorizationType
  suggestions: ApiCategorization[]
}
export type Categorization = AutoCategorization | SuggestedCategorization

export type AccountIdentifierPayloadObject =
  | {
    type: 'StableName'
    stable_name: string
  }
  | {
    type: 'AccountId'
    id: string
  }
  | {
    type: 'Exclusion'
    exclusion_type: string
  }

export type SingleCategoryUpdate = {
  type: 'Category'
  category: ClassificationEncoded
}

export type SplitCategoryUpdate = {
  type: 'Split'
  entries: {
    category: ClassificationEncoded
    amount: number
    tags?: Array<{ key: string, value: string }>
    customer_id?: string | null
    vendor_id?: string | null
  }[]
}
export type CategoryUpdate = SingleCategoryUpdate | SplitCategoryUpdate

export function hasSuggestions(
  categorization: Categorization | null,
): categorization is SuggestedCategorization {
  return (
    categorization != null
    && (categorization as SuggestedCategorization).suggestions !== undefined
    && (categorization as SuggestedCategorization).suggestions.length > 0
  )
}

export const accountIdentifierIsForCategory = (accountIdentifier: AccountIdentifier, category: NestedCategorization): boolean => {
  if (accountIdentifier.type === 'AccountId') {
    switch (category.type) {
      case 'AccountNested':
        return AccountIdEquivalence(accountIdentifier, makeAccountId(category.id))
      case 'OptionalAccountNested':
        return false
      case 'ExclusionNested':
        return false
    }
  }

  switch (category.type) {
    case 'AccountNested':
      return category.stableName ? AccountStableNameEquivalence(accountIdentifier, makeStableName(category.stableName)) : false
    case 'OptionalAccountNested':
      return AccountStableNameEquivalence(accountIdentifier, makeStableName(category.stableName))
    case 'ExclusionNested':
      return false
  }
}

export const getLeafCategories = (categories: NestedCategorization[]): NestedCategorization[] => {
  return categories.flatMap((category) => {
    if (!category.subCategories || category.subCategories.length === 0) {
      return [category]
    }
    return getLeafCategories(category.subCategories)
  })
}
