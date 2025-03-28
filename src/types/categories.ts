export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  JOURNALING = 'JOURNALING',
  MATCHED = 'MATCHED',
}

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
