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
  subCategories: Category[]
}

export interface BankTransaction {
  id: string
  date: string
  amount: number
  direction: Direction
  counterparty_name: string
  category: Category
  categorization_status: CategorizationStatus
}
