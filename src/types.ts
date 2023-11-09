export type Params = Record<string, string>

export type OAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type LayerContextValues = {
  auth: OAuthResponse | undefined
  businessId: string
  categories: Category[]
}

export enum CategorizationStatus {
  PENDING = 'PENDING',
  READY_FOR_INPUT = 'READY_FOR_INPUT',
  LAYER_REVIEW = 'LAYER_REVIEW',
  CATEGORIZED = 'CATEGORIZED',
  SPLIT = 'SPLIT',
  JOURNALING = 'JOURNALING',
}

export type ISODateString = string
export type UUID = string
export type Direction = 'CREDIT' | 'DEBIT'

export interface Category {
  display_name: string
  category: string
  subCategories: Category[]
}

export interface Transaction {
  date: ISODateString
  amount: number
  direction: Direction
  counterparty_name: string
  category: Category
  categorization_status: CategorizationStatus
}
