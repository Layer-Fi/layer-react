import { toDefinedSearchParameters } from '@utils/request/toDefinedSearchParameters'
import { get, patch, post } from '@api/layer/authenticated_http'
import type {
  ApiTaxEstimates,
  ApiTaxDetails,
  ApiTaxOverview,
  ApiTaxChecklist,
  ApiTaxPayments,
  ApiTaxProfile,
  S3PresignedUrl,
  TaxReportingBasis,
  TaxExportType,
  FilingStatus,
} from '@schemas/taxEstimates'

type GetTaxEstimatesParams = {
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

type GetTaxDetailsParams = {
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
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/details?${parameters}`
  },
)

type GetTaxOverviewParams = {
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
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/overview?${parameters}`
  },
)

type GetTaxChecklistParams = {
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

type GetTaxPaymentsParams = {
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
    const parameters = toDefinedSearchParameters({ year, reporting_basis: reportingBasis, full_year_projection: fullYearProjection })
    return `/v1/businesses/${businessId}/tax-estimates/payments?${parameters}`
  },
)

type GetTaxProfileParams = {
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

export type TaxProfileInput = {
  type?: string
  tax_country_code?: string | null
  us_configuration?: {
    federal?: {
      filing_status?: FilingStatus | null
      annual_w2_income?: number | null
      tip_income?: number | null
      overtime_income?: number | null
      withholding?: {
        use_custom_withholding?: boolean | null
        amount?: number | null
      } | null
    } | null
    state?: {
      tax_state?: string | null
      filing_status?: FilingStatus | null
      num_exemptions?: number | null
      withholding?: {
        use_custom_withholding?: boolean | null
        amount?: number | null
      } | null
    } | null
    deductions?: {
      home_office?: {
        use_home_office_deduction?: boolean | null
        home_office_area?: number | null
      } | null
      vehicle?: {
        use_mileage_deduction?: boolean | null
        vehicle_business_percent?: number | null
        mileage?: {
          use_user_estimated_business_mileage?: boolean | null
          user_estimated_business_mileage?: number | null
        } | null
      } | null
    } | null
    business_estimates?: {
      expenses?: {
        use_user_estimated_expenses?: boolean | null
        user_estimated_expenses?: number | null
      } | null
    } | null
  } | null
}

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

type ExportTaxDocumentsParams = {
  businessId: string
  type: TaxExportType
  year: string
}

export type ExportTaxDocumentsReturn = {
  data: S3PresignedUrl
}

export const exportTaxDocuments = post<
  ExportTaxDocumentsReturn,
  Record<string, never>,
  ExportTaxDocumentsParams
>(({ businessId, type, year }) => {
  const parameters = toDefinedSearchParameters({ type, year })
  return `/v1/businesses/${businessId}/tax-estimates/export?${parameters}`
})
