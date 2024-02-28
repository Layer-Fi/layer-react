export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  JOURNALING = 'JOURNALING',
  MATCHED = 'MATCHED',
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

export type SingleCategoryUpdate = {
  type: 'Category'
  category: {
    type: 'StableName'
    stable_name: string
  }
}
export type SplitCategoryUpdate = {
  type: 'Split'
  entries: {
    category: string
    amount: number
  }[]
}
export type CategoryUpdate = SingleCategoryUpdate | SplitCategoryUpdate

export function hasSuggestions(
  categorization: Categorization,
): categorization is SuggestedCategorization {
  return (categorization as SuggestedCategorization).suggestions !== undefined
}
