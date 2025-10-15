import { AccountIdentifier, AccountIdEquivalence, AccountStableNameEquivalence, makeAccountId, makeStableName } from '../schemas/accountIdentifier'

type BaseCategory = {
  display_name: string
  category: string
  subCategories: Array<Category> | null
  description: string | null
}

type AccountNestedCategory = {
  type: 'AccountNested'
  id: string
  stable_name: string | null
} & BaseCategory
type OptionalAccountNestedCategory = {
  type: 'OptionalAccountNested'
  stable_name: string
} & BaseCategory
type ExclusionNestedCategory = {
  type: 'ExclusionNested'
  id: string
} & BaseCategory

export type Category =
  | AccountNestedCategory
  | OptionalAccountNestedCategory
  | ExclusionNestedCategory

export function isAccountNestedCategory(
  v: Category,
): v is AccountNestedCategory {
  return v.type === 'AccountNested'
}

export function isOptionalAccountNestedCategory(
  v: Category,
): v is OptionalAccountNestedCategory {
  return v.type === 'OptionalAccountNested'
}

export function isExclusionNestedCategory(
  v: Category,
): v is ExclusionNestedCategory {
  return v.type === 'ExclusionNested'
}

export enum CategorizationType {
  AUTO = 'AUTO',
  ASK_FROM_SUGGESTIONS = 'ASK_FROM_SUGGESTIONS',
  MEALS = 'MEALS',
  BUSINESS_TRAVEL_TRANSPORTATION = 'BUSINESS_TRAVEL_TRANSPORTATION',
}

export interface AutoCategorization {
  type: CategorizationType.AUTO
  category: Category
}
export interface SuggestedCategorization {
  type: CategorizationType
  suggestions: Category[]
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
  category: AccountIdentifierPayloadObject
}

export type SplitCategoryUpdate = {
  type: 'Split'
  entries: {
    category: string | AccountIdentifierPayloadObject
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

export const accountIdentifierIsForCategory = (accountIdentifier: AccountIdentifier, category: Category) => {
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
      return category.stable_name ? AccountStableNameEquivalence(accountIdentifier, makeStableName(category.stable_name)) : null
    case 'OptionalAccountNested':
      return AccountStableNameEquivalence(accountIdentifier, makeStableName(category.stable_name))
    case 'ExclusionNested':
      return false
  }
}

export const getLeafCategories = (categories: Category[]): Category[] => {
  return categories.flatMap((category) => {
    if (!category.subCategories || category.subCategories.length === 0) {
      return [category]
    }
    return getLeafCategories(category.subCategories)
  })
}
