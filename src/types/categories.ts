export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  JOURNALING = 'JOURNALING',
  MATCHED = 'MATCHED',
}

export enum CategorizationScope {
  TO_REVIEW = 'TO_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
}

export interface CategoryEntry {
  amount?: number
  category: Category
}

export interface Category {
  id: string
  type: string
  display_name: string
  category: string
  stable_name?: string
  subCategories?: Category[]
  entries?: CategoryEntry[]
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
  categorization: Categorization,
): categorization is SuggestedCategorization {
  return (categorization as SuggestedCategorization).suggestions !== undefined
}
