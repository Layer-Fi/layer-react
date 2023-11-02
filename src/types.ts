export type OAuthResponse = {
  access_token: string
  token_type: string
  expires_in: number
}

export type LayerExecutionContext = {
  auth: OAuthResponse | undefined
  businessId: string
}

export type ISODateString = string
export type UUID = string
export type Direction = 'CREDIT' | 'DEBIT'

export interface Category {
  display_name: string
}

export interface Transaction {
  date: ISODateString
  amount: number
  direction: Direction
  counterparty_name: string
  category: Category
}
