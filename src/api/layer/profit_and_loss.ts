import { S3PresignedUrl } from '@internal-types/general'
import type {
  ProfitAndLossComparison,
  ProfitAndLossComparisonRequestBody,
} from '@internal-types/profit_and_loss'
import { get, post } from '@api/layer/authenticated_http'
import { toLocalDateString } from '@utils/time/timeUtils'

type BaseProfitAndLossParams = {
  businessId: string
  startDate?: Date
  endDate?: Date
  month?: string
  year?: string
  tagKey?: string
  tagValues?: string
  reportingBasis?: string
}

type GetProfitAndLossCsvParams = BaseProfitAndLossParams & {
  moneyFormat?: string
}

export const compareProfitAndLoss = post<
  {
    data?: ProfitAndLossComparison
    error?: unknown
  },
  ProfitAndLossComparisonRequestBody
>(
  ({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss-comparison`,
)

export const getProfitAndLossCsv = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossCsvParams) => {
  const { businessId, startDate, endDate, month, year, tagKey, tagValues, reportingBasis, moneyFormat } = params
  return get<{
    data?: S3PresignedUrl
    error?: unknown
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/csv?${
      startDate ? `start_date=${encodeURIComponent(toLocalDateString(startDate))}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(toLocalDateString(endDate))}` : ''}${
      month ? `&month=${month}` : ''
    }${year ? `&year=${year}` : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }${moneyFormat ? `&money_format=${moneyFormat}` : ''}`,
  )(apiUrl, accessToken, { params: { businessId } })
}

export const getProfitAndLossExcel = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossCsvParams) => {
  const { businessId, startDate, endDate, month, year, tagKey, tagValues, reportingBasis, moneyFormat } = params
  return get<{
    data?: S3PresignedUrl
    error?: unknown
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/excel?${
      startDate ? `start_date=${encodeURIComponent(toLocalDateString(startDate))}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(toLocalDateString(endDate))}` : ''}${
      month ? `&month=${month}` : ''
    }${year ? `&year=${year}` : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }${moneyFormat ? `&money_format=${moneyFormat}` : ''}`,
  )(apiUrl, accessToken, { params: { businessId } })
}

export const profitAndLossComparisonCsv = post<{
  data?: S3PresignedUrl
  error?: unknown
}>(
  ({ businessId, moneyFormat }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/comparison-csv?money_format=${
      moneyFormat ? moneyFormat : 'DOLLAR_STRING'
    }`,
)
