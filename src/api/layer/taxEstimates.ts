import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { get, patch, post } from '@api/layer/authenticated_http'

type GetTaxEstimatesParams = {
  businessId: string
  year?: number
}

export const getTaxEstimates = get<Record<string, unknown>, GetTaxEstimatesParams>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/taxes/estimates?${parameters}`
  },
)

type GetTaxOverviewParams = {
  businessId: string
  year?: number
}

export const getTaxOverview = get<Record<string, unknown>, GetTaxOverviewParams>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/taxes/overview?${parameters}`
  },
)

type GetTaxChecklistParams = {
  businessId: string
  year?: number
}

export const getTaxChecklist = get<Record<string, unknown>, GetTaxChecklistParams>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/taxes/checklist?${parameters}`
  },
)

type GetTaxPaymentsParams = {
  businessId: string
  year?: number
}

export const getTaxPayments = get<Record<string, unknown>, GetTaxPaymentsParams>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/taxes/payments?${parameters}`
  },
)

type GetTaxProfileParams = {
  businessId: string
}

export const getTaxProfile = get<Record<string, unknown>, GetTaxProfileParams>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/taxes/profile`
  },
)

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

export const createTaxProfile = post<
  Record<string, unknown>,
  TaxProfileInput,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/taxes/profile`)

export const updateTaxProfile = patch<
  Record<string, unknown>,
  TaxProfileInput,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/taxes/profile`)

type ExportTaxDocumentsParams = {
  businessId: string
  type: 'tax-packet' | 'schedule-c' | 'payment-history'
  year?: string
}

export const exportTaxDocuments = post<
  Record<string, unknown>,
  Record<string, never>,
  ExportTaxDocumentsParams
>(({ businessId, type, year }) => {
  const parameters = toDefinedSearchParameters({ type, year })
  return `/v1/businesses/${businessId}/taxes/export?${parameters}`
})
