import { ProfitAndLoss } from '../../types'
import { S3PresignedUrl } from '../../types/general'
import {
  ProfitAndLossComparison,
  ProfitAndLossSummaries,
} from '../../types/profit_and_loss'
import { get, post } from './authenticated_http'

export const getProfitAndLoss = get<{
  data?: ProfitAndLoss
  error?: unknown
}>(
  ({ businessId, startDate, endDate, tagKey, tagValues, reportingBasis }) =>
    `/v1/businesses/${businessId}/reports/profit-and-loss?start_date=${
      startDate ? encodeURIComponent(startDate) : ''
    }&end_date=${endDate ? encodeURIComponent(endDate) : ''}${
      reportingBasis ? `&reporting_basis=${reportingBasis}` : ''
    }${tagKey ? `&tag_key=${tagKey}` : ''}${
      tagValues ? `&tag_values=${tagValues}` : ''
    }`,
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
