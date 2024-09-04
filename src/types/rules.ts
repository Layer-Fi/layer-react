export interface Rules {
  type: string
  rules: Rule[]
}

export interface Rule {
  id: string
  name: string
  businessId?: string
  clientId?: string
  industry?: string
  isGlobal?: boolean
  category?: string // Is this a class?
  suggestion1?: string
  suggestion2?: string
  suggestion3?: string
  businessNameFilter?: string
  clientNameFilter?: string
  merchantTypeFilter?: string
  transactionDescriptionFilter?: string
  transactionTypeFilter?: string
  bankDirectionFilter?: string
  amountMinFilter?: number
  amountMaxFilter?: number
  created_at: string // The naming convention changes from snake_case to camelCase
  updated_at?: string
}

// TODO: Move to API
export class CategorizationRulePostParams {
  category?: string
  suggestion1?: string 
  suggestion2?: string
  suggestion3?: string 
  businessNameFilter?: string
  clientNameFilter?: string
  transactionDescriptionFilter?: string
  transactionTypeFilter?: string
  bankDirectionFilter?: string
  amountMinFilter?: number
  amountMaxFilter?: number
}