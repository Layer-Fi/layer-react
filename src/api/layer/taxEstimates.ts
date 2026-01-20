import type {
  ApiTaxChecklist,
  ApiTaxDetails,
  ApiTaxEstimates,
  ApiTaxOverview,
  ApiTaxPayments,
  ApiTaxProfile,
  TaxProfileInput,
  TaxReportingBasis,
} from '@schemas/taxEstimates'
import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { get, patch, post } from '@api/layer/authenticated_http'

export type GetTaxEstimatesParams = {
  businessId: string
  year: number
}

export type GetTaxEstimatesReturn = {
  data: ApiTaxEstimates
}

export const getTaxEstimates = get<GetTaxEstimatesReturn, GetTaxEstimatesParams>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/tax-estimates?${parameters}`
  },
)

export type GetTaxDetailsParams = {
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

export type GetTaxDetailsReturn = {
  data: ApiTaxDetails
}

export const getTaxDetails = get<GetTaxDetailsReturn, GetTaxDetailsParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reportingBasis, fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/details?${parameters}`
  },
)

export type GetTaxOverviewParams = {
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

export type GetTaxOverviewReturn = {
  data: ApiTaxOverview
}

export const getTaxOverview = get<GetTaxOverviewReturn, GetTaxOverviewParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reportingBasis, fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/overview?${parameters}`
  },
)

export type GetTaxChecklistParams = {
  businessId: string
  year: number
}

export type GetTaxChecklistReturn = {
  data: ApiTaxChecklist
}

export const getTaxChecklist = get<GetTaxChecklistReturn, GetTaxChecklistParams>(
  ({ businessId, year }) => {
    const parameters = toDefinedSearchParameters({ year })
    return `/v1/businesses/${businessId}/tax-estimates/checklist?${parameters}`
  },
)

export type GetTaxPaymentsParams = {
  businessId: string
  year: number
  reportingBasis?: TaxReportingBasis
  fullYearProjection?: boolean
}

export type GetTaxPaymentsReturn = {
  data: ApiTaxPayments
}

export const getTaxPayments = get<GetTaxPaymentsReturn, GetTaxPaymentsParams>(
  ({ businessId, year, reportingBasis, fullYearProjection }) => {
    const parameters = toDefinedSearchParameters({ year, reportingBasis, fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/payments?${parameters}`
  },
)

export type GetTaxProfileParams = {
  businessId: string
}

export type GetTaxProfileReturn = {
  data: ApiTaxProfile
}

export const getTaxProfile = get<GetTaxProfileReturn, GetTaxProfileParams>(
  ({ businessId }) => {
    return `/v1/businesses/${businessId}/tax-estimates/profile`
  },
)

export type CreateTaxProfileReturn = {
  data: ApiTaxProfile
}

export const createTaxProfile = post<
  CreateTaxProfileReturn,
  TaxProfileInput,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)

export type UpdateTaxProfileReturn = {
  data: ApiTaxProfile
}

export const updateTaxProfile = patch<
  UpdateTaxProfileReturn,
  TaxProfileInput,
  { businessId: string }
>(({ businessId }) => `/v1/businesses/${businessId}/tax-estimates/profile`)
