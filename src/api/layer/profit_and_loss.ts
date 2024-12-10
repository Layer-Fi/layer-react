import { ProfitAndLoss } from '../../types'
import { S3PresignedUrl } from '../../types/general'
import {
  ProfitAndLossComparison,
  ProfitAndLossSummaries,
} from '../../types/profit_and_loss'
import { get, post } from './authenticated_http'

function buildUrl(
  baseUrl: string,
  params: Record<string, string | number | null | undefined>
): string {
  const queryString = Object.entries(params)
    .filter(([_, value]) => value != null && value != undefined)
    .map(
      ([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    )
    .join('&');

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

export const getProfitAndLoss = get<{
  data?: ProfitAndLoss
  error?: unknown
}>(
  ({ businessId, startDate, endDate, tagKey,
    tagValues, reportingBasis, structure, month, year }) =>
      buildUrl(
        `/v1/businesses/${businessId}/reports/profit-and-loss`,
        {
          start_date: startDate,
          end_date: endDate,
          reporting_basis: reportingBasis,
          tag_key: tagKey,
          tag_values: tagValues,
          structure,
          month,
          year,
        }
      )
)

export const compareProfitAndLoss = post<{
  data?: ProfitAndLossComparison
  error?: unknown
}>(
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

export const getProfitAndLossCsv = get<{
  data?: S3PresignedUrl
  error?: unknown
}>(
  ({
    businessId,
    startDate,
    endDate,
    month,
    year,
    tagKey,
    tagValues,
    reportingBasis,
    moneyFormat,
  }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/csv?${
      startDate ? `start_date=${encodeURIComponent(startDate)}` : ''
    }${endDate ? `&end_date=${encodeURIComponent(endDate)}` : ''}${
      month ? `&month=${month}` : ''
    }${year ? `&year=${year}` : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }${moneyFormat ? `&money_format=${moneyFormat}` : ''}`,
)

export const profitAndLossComparisonCsv = post<{
  data?: S3PresignedUrl
  error?: unknown
}>(
  ({ businessId, moneyFormat }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss/exports/comparison-csv?money_format=${
      moneyFormat ? moneyFormat : 'DOLLAR_STRING'
    }`,
)
