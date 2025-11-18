import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { get, patch, post } from '@api/layer/authenticated_http'

export type FederalTaxesBreakdown = {
  adjusted_gross_income: number
  standard_deduction: number
  qbi_deduction: number
  taxable_income: number
  income_tax: number
  social_security_tax: number
  medicare_tax: number
}

export type FederalTaxes = {
  total: number
  taxes_owed: number
  taxes_paid: number
  breakdown: FederalTaxesBreakdown
}

export type StateTaxesBreakdown = {
  taxable_income: number
  state_tax_estimate: number
}

export type StateTaxes = {
  total: number
  taxes_owed: number
  taxes_paid: number
  breakdown: StateTaxesBreakdown
}

export type TaxableBusinessIncome = {
  business_income: number
  deductible_expenses: number
  deductible_mileage_expenses: number
  self_employment_deduction: number
  qualified_tip_deduction: number
  qualified_overtime_deduction: number
  adjusted_gross_income: number
}

export type QuarterlyEstimate = {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  amount: number
  due_date: string
}

export type TaxEstimate = {
  projected_taxes_owed: number
  taxes_due_date: string
  federal_taxes: FederalTaxes
  state_taxes: StateTaxes
  taxable_business_income: TaxableBusinessIncome
  quarterly_estimates: QuarterlyEstimate[]
}

export type GetTaxEstimatesReturn = {
  data: TaxEstimate
}

type GetTaxEstimatesParams = {
  businessId: string
  year?: number
}

export const getTaxEstimates = get<
  GetTaxEstimatesReturn,
  GetTaxEstimatesParams
>(({ businessId, year }) => {
  const parameters = toDefinedSearchParameters({ year })
  return `/v1/businesses/${businessId}/taxes/estimates?${parameters}`
})

export type TaxDeadline = {
  date: string
  description: string
  amount: number
}

export type TaxOverview = {
  taxable_income_estimate: number
  excludes_pending_transactions: boolean
  total_income: number
  deductions: number
  estimated_taxes: {
    total_owed: number
    taxes_due_date: string
    federal: number
    state: number
  }
  deadlines: TaxDeadline[]
}

export type GetTaxOverviewReturn = {
  data: TaxOverview
}

type GetTaxOverviewParams = {
  businessId: string
  year?: number
}

export const getTaxOverview = get<
  GetTaxOverviewReturn,
  GetTaxOverviewParams
>(({ businessId, year }) => {
  const parameters = toDefinedSearchParameters({ year })
  return `/v1/businesses/${businessId}/taxes/overview?${parameters}`
})

export type ChecklistItem = {
  id: string
  description: string
  amount: number
  status: 'pending' | 'completed'
  action_url?: string
}

export type TaxChecklist = {
  items: ChecklistItem[]
}

export type GetTaxChecklistReturn = {
  data: TaxChecklist
}

type GetTaxChecklistParams = {
  businessId: string
  year?: number
}

export const getTaxChecklist = get<
  GetTaxChecklistReturn,
  GetTaxChecklistParams
>(({ businessId, year }) => {
  const parameters = toDefinedSearchParameters({ year })
  return `/v1/businesses/${businessId}/taxes/checklist?${parameters}`
})

export type QuarterlyPayment = {
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  rolled_over_from_previous_quarter: number
  owed_this_quarter: number
  total_paid: number
  total: number
}

export type TaxPayments = {
  quarters: QuarterlyPayment[]
}

export type GetTaxPaymentsReturn = {
  data: TaxPayments
}

type GetTaxPaymentsParams = {
  businessId: string
  year?: number
}

export const getTaxPayments = get<
  GetTaxPaymentsReturn,
  GetTaxPaymentsParams
>(({ businessId, year }) => {
  const parameters = toDefinedSearchParameters({ year })
  return `/v1/businesses/${businessId}/taxes/payments?${parameters}`
})

export type GeneralInformation = {
  first_name: string
  last_name: string
  email: string
  phone_personal: string
  date_of_birth: string | null
  ssn: string
}

export type ProfileDetails = {
  work_description: string | null
  filing_status: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household' | 'qualifying_widow' | null
  us_state: string | null
  canadian_province: string | null
}

export type TaxProfile = {
  general_information: GeneralInformation
  profile: ProfileDetails
}

export type GetTaxProfileReturn = {
  data: TaxProfile
}

type GetTaxProfileParams = {
  businessId: string
}

export const getTaxProfile = get<
  GetTaxProfileReturn,
  GetTaxProfileParams
>(({ businessId }) => {
  return `/v1/businesses/${businessId}/taxes/profile`
})

export type TaxProfileInput = {
  general_information?: {
    first_name?: string
    last_name?: string
    email?: string
    phone_personal?: string
    date_of_birth?: string | null
    ssn?: string
  }
  profile?: {
    work_description?: string | null
    filing_status?: 'single' | 'married_filing_jointly' | 'married_filing_separately' | 'head_of_household' | 'qualifying_widow' | null
    us_state?: string | null
    canadian_province?: string | null
  }
}

export type CreateTaxProfileReturn = {
  data: TaxProfile
}

export type UpdateTaxProfileReturn = {
  data: TaxProfile
}

export const createTaxProfile = post<
  CreateTaxProfileReturn,
  TaxProfileInput,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/taxes/profile`)

export const updateTaxProfile = patch<
  UpdateTaxProfileReturn,
  TaxProfileInput,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/taxes/profile`)

export type ExportUrl = {
  url: string
  expires_at: string
}

export type ExportTaxDocumentsReturn = {
  data: ExportUrl
}

type ExportTaxDocumentsParams = {
  businessId: string
  type: 'tax-packet' | 'schedule-c' | 'payment-history'
  year?: string
}

export const exportTaxDocuments = post<
  ExportTaxDocumentsReturn,
  Record<string, never>,
  ExportTaxDocumentsParams
>(({ businessId, type, year }) => {
  const parameters = toDefinedSearchParameters({ type, year })
  return `/v1/businesses/${businessId}/taxes/export?${parameters}`
})
