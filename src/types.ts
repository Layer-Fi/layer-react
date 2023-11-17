export type OAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type LayerContextValues = {
  auth: OAuthResponse
  businessId: string
  categories: Category[]
}

export enum LayerContextActionName {
  setAuth = 'LayerContext.setAuth',
  setCategories = 'LayerContext.setCategories',
}

export type LayerContextAction =
  | {
      type: LayerContextActionName.setAuth
      payload: { auth: LayerContextValues['auth'] }
    }
  | {
      type: LayerContextActionName.setCategories
      payload: { categories: LayerContextValues['categories'] }
    }

export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  JOURNALING = 'JOURNALING',
}

export type Direction = 'CREDIT' | 'DEBIT'

export interface Category {
  display_name: string
  category: string
  stable_name: string
  subCategories: Category[]
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

export interface BankTransaction {
  id: string
  date: string
  amount: number
  direction: Direction
  counterparty_name: string
  category: Category
  categorization_status: CategorizationStatus
  categorization_flow: AutoCategorization | SuggestedCategorization
}

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
