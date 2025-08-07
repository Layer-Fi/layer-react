import { ProfitAndLoss } from '../../types'
import { S3PresignedUrl } from '../../types/general'
import type {
  ProfitAndLossComparison,
  ProfitAndLossComparisonRequestBody,
  ProfitAndLossSummaries,
} from '../../types/profit_and_loss'
import { get, post } from './authenticated_http'
import { toLocalDateString } from '../../utils/time/timeUtils'

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

type GetProfitAndLossParams = BaseProfitAndLossParams
type GetProfitAndLossCsvParams = BaseProfitAndLossParams & {
  moneyFormat?: string
}

type GetProfitAndLossDetailLinesParams = {
  businessId: string
  startDate: Date
  endDate: Date
  pnlStructureLineItemName: string
  tagKey?: string
  tagValues?: string
  reportingBasis?: string
  pnlStructure?: string
}

export const getProfitAndLoss = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossParams) => {
  const { businessId, startDate, endDate, month, year, tagKey, tagValues, reportingBasis } = params
  return get<{
    data?: ProfitAndLoss
    error?: unknown
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss?${
      startDate ? `start_date=${encodeURIComponent(toLocalDateString(startDate))}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(toLocalDateString(endDate))}` : ''}${
      month ? `&month=${month}` : ''
    }${year ? `&year=${year}` : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }`,
  )(apiUrl, accessToken, { params: { businessId } })
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

export const getProfitAndLossSummaries = get<{
  data?: ProfitAndLossSummaries
  error?: unknown
}>(
  ({
    businessId,
    startYear,
    startMonth,
    endYear,
    endMonth,
    tagKey,
    tagValues,
    reportingBasis,
  }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss-summaries?start_year=${
      startYear ? encodeURIComponent(startYear) : ''
    }&start_month=${
      startMonth ? encodeURIComponent(startMonth) : ''
    }&end_year=${endYear ? encodeURIComponent(endYear) : ''}&end_month=${
      endMonth ? encodeURIComponent(endMonth) : ''
    }${reportingBasis ? `&reporting_basis=${reportingBasis}` : ''}${
      tagKey ? `&tag_key=${tagKey}` : ''
    }${tagValues ? `&tag_values=${tagValues}` : ''}`,
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

export const getProfitAndLossDetailLines = (apiUrl: string, accessToken: string | undefined, params: GetProfitAndLossDetailLinesParams) => {
  const { businessId, startDate, endDate, pnlStructureLineItemName, tagKey, tagValues, reportingBasis, pnlStructure } = params
  return get<{
    data?: unknown
    error?: unknown
  }>(({ businessId }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/lines?${
      startDate ? `start_date=${encodeURIComponent(toLocalDateString(startDate))}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(toLocalDateString(endDate))}` : ''}${
      pnlStructureLineItemName ? `&line_item_name=${encodeURIComponent(pnlStructureLineItemName)}` : ''
    }${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }${pnlStructure ? `&pnl_structure=${pnlStructure}` : ''}`,
  )(apiUrl, accessToken, { params: { businessId } })
}
