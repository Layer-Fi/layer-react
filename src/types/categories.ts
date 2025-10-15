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
export class CategoryAsOption {
  private internalCategory: Category

  constructor(category: Category) {
    this.internalCategory = category
  }

  get label() {
    return this.internalCategory.display_name
  }

  get accountId() {
    if (isAccountNestedCategory(this.internalCategory)) return makeAccountId(this.internalCategory.id)
    return null
  }

  get accountStableName() {
    if (isOptionalAccountNestedCategory(this.internalCategory)) return makeStableName(this.internalCategory.stable_name)
    if (isAccountNestedCategory(this.internalCategory) && this.internalCategory.stable_name) return makeStableName(this.internalCategory.stable_name)
    return null
  }

  get accountIdentifier() {
    if (isOptionalAccountNestedCategory(this.internalCategory)) return makeStableName(this.internalCategory.stable_name)
    return makeAccountId(this.internalCategory.id)
  }

  get value() {
    if (isOptionalAccountNestedCategory(this.internalCategory)) return this.internalCategory.stable_name
    return this.internalCategory.id
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

export const findCategoryInOptions = (category: AccountIdentifier, options: CategoryAsOption[]): CategoryAsOption | undefined => {
  return options.find((option) => {
    if (category.type === 'AccountId') {
      return option.accountId ? AccountIdEquivalence(category, option.accountId) : false
    }
    return option.accountStableName ? AccountStableNameEquivalence(category, option.accountStableName) : false
  })
}
